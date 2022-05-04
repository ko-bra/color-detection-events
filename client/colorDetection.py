# import libraries
import cv2
import numpy as np
import paho.mqtt.client as paho
import dataclasses
import json
import time

@dataclasses.dataclass
class ColorAppearanceEvent:
    client_id: str
    timestamp: int
    color: str
    visible: bool

@dataclasses.dataclass
class Color:
    name: str
    thresold_low: int
    thresold_high: int
    detected: bool = False
    
class MQTTColorEventPublisher:

    def __init__(self, client_id, url, port, topic, qos=2):
        self.client_id = client_id
        self.url = url
        self.port = port
        self.topic = topic
        self.qos = qos
        self.client = paho.Client()

    def mqtt_on_connect(self, client, userdata, flags, rc):
        print("CONNACK received with code %d." % (rc))

    def connect(self):
        # Connecting to MQTT Broker
        self.client.on_connect = self.mqtt_on_connect
        print("Connecting to MQTT Broker...")
        self.client.connect(self.url, self.port)
        self.client.loop_start()

    def publishColorEvent(self, color):

        event = ColorAppearanceEvent(self.client_id, time.time(), color.name, color.detected)
        return self.client.publish(self.topic, json.dumps(dataclasses.asdict(event)), qos=self.qos)

def main():
    # define a video capture object on source 0
    vid = cv2.VideoCapture(0)

    mqtt_client = MQTTColorEventPublisher("Macbook_Korbinian", "broker.mqttdashboard.com", 1883, "technology_researcher_challenge/events")
    mqtt_client.connect()

    # define colors to detect
    colors = [Color("blue", np.array([110, 50, 50]), np.array([130, 255, 255])),
              Color("red_low", np.array([0, 130, 100]), np.array([5, 255, 255])),
              Color("red_high", np.array([175, 130, 100]), np.array([180, 255, 255])),
              Color("yellow", np.array([20, 130, 100]), np.array([60, 255, 255]))]

    # Image Processing Loop
    while(True):
          
        # Capture the webcam
        ret, frame_bgr = vid.read()
        # Convert frame to HSV color space
        frame_hsv = cv2.cvtColor(frame_bgr, cv2.COLOR_BGR2HSV)
        
        combined_mask = None
        for c in colors:
            # creating a mask based on the color thresold and image
            mask = cv2.inRange(frame_hsv, c.thresold_low, c.thresold_high)

            # check if detection status of color has changed since last frame
            if bool(cv2.countNonZero(mask)) != c.detected:
                c.detected = not c.detected
                (rc, mid) = mqtt_client.publishColorEvent(c)
                print ("%s: %s" % (c.name, c.detected))

            # combine masks to one for preview
            combined_mask = cv2.bitwise_or(mask if combined_mask is None else combined_mask, mask)

        # Multiply mask and image to only show colors within the thresold
        preview = cv2.bitwise_and(frame_bgr, frame_bgr, mask = combined_mask)
        cv2.imshow('preview', preview)
        if cv2.waitKey(1) & 0xFF == 27:
            break
        
    # After the loop release the cap object
    vid.release()
    # Destroy all the windows
    cv2.destroyAllWindows()
    # Stop MQTT processing loop
    client.loop_stop()

if __name__ == "__main__":
    main()