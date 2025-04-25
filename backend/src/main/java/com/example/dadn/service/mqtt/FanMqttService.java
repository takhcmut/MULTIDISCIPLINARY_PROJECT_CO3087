package com.example.dadn.service.mqtt;

import com.example.dadn.entities.Equipment;
import com.example.dadn.entities.History;
import com.example.dadn.entities.enums.Enum_state;
import com.example.dadn.entities.key.EquipKey;
import com.example.dadn.entities.key.HistoryKey;
import com.example.dadn.repositories.EquipmentRepository;
import com.example.dadn.repositories.HistoryRepository;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import org.eclipse.paho.client.mqttv3.*;
import org.eclipse.paho.client.mqttv3.persist.MemoryPersistence;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.LocalDateTime;

@Service
public class FanMqttService {

    private final EquipmentRepository equipmentRepo;
    private final HistoryRepository historyRepo;

    public FanMqttService(EquipmentRepository equipmentRepo, HistoryRepository historyRepo) {
        this.equipmentRepo = equipmentRepo;
        this.historyRepo = historyRepo;
    }

    @Value("${adafruit.username}")
    private String username;

    @Value("${adafruit.aio-key}")
    private String aioKey;

    private final String feedKey = "button2"; // Đây là feed của quạt
    private MqttClient client;

    @PostConstruct
    public void init() throws MqttException {
        String brokerUrl = "ssl://io.adafruit.com:8883";
        String clientId = username + "-fan-service";

        client = new MqttClient(brokerUrl, clientId, new MemoryPersistence());

        MqttConnectOptions connOpts = new MqttConnectOptions();
        connOpts.setUserName(username);
        connOpts.setPassword(aioKey.toCharArray());
        connOpts.setCleanSession(true);

        client.connect(connOpts);
        System.out.println("✅ Kết nối MQTT tới Adafruit IO thành công (FanMqttService)");

        String topic = username + "/feeds/" + feedKey;
        client.subscribe(topic, (receivedTopic, message) -> {
            String payload = new String(message.getPayload());
            System.out.println("📩 Nhận từ feed '" + feedKey + "': " + payload);

            int value = Integer.parseInt(payload);
            Enum_state newState = value == 1 ? Enum_state.On : Enum_state.Off;

            // ✅ Tạo EquipKey để tìm thiết bị quạt
            EquipKey key = new EquipKey();
            key.setEquipId(5); // ⚠️ CHÚ Ý: ID này phải là ID của quạt trong bảng `equipment`

            Equipment equip = equipmentRepo.findById(key).orElse(null);
            if (equip != null) {
                equip.setEquipment_state(newState);
                equipmentRepo.save(equip);

                // Lưu lịch sử
                History history = new History();
                history.setEquipId(key.getEquipId());
                history.setUsername("admin"); // hoặc lấy từ người dùng nào đó nếu cần
                history.setEquipment_state(newState);
                history.setUpdateTime(Timestamp.valueOf(LocalDateTime.now()));
                history.setHistoryKey(new HistoryKey()); // Hibernate sẽ tự tăng ID nếu cấu hình đúng

                historyRepo.save(history);
                System.out.println("📥 Đã cập nhật trạng thái và lưu lịch sử thiết bị (quạt).");
            }
        });
    }

    @PreDestroy
    public void disconnect() throws MqttException {
        if (client != null && client.isConnected()) {
            client.disconnect();
            System.out.println("⛔ Đã ngắt kết nối MQTT (FanMqttService)");
        }
    }
}
