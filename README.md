# CODEEV - Generate Color Recognition Events 
A configurable software package that detects color changes in video camera streams and offers related events via an API. The API can be integrated with Execution Management Systems like the Celonis EMS or other Process Mining Solutions.

## Overview
This software package consists of a local scanner and a server application.

**Scanner** (1-n devices)
- Detects color changes in a video camera stream
- Generates events based on changes and publishes them via MQTT

**Server**
- Subscribes to the MQTT event stream and persists events
- Serves events via a REST API

## Scanner
The scanners observes a video camera feed and detects the appearance and disapperance of certain colors. These detections are translated into events
### Requirements
- Python
- Camera hardware accessible by OpenCV

### Installation
To install the neccessary dependencies for the scanner application you can simply run

`pip install -r requirements.txt`

### Run
`python colorDetection.py`

### Configuration
The scanner can be configured by adapting the default [config.yml](client/config.yml) file.
```
client:
  id: "Client1"
  video_source: 0
broker:
  url: "broker.mqttdashboard.com"
  port: 1883
  topic: "default_mqtt_topic_change_me/events"
colors:
  - name: blue
    thresold_low: [110, 50, 50]
    thresold_high: [130, 255, 255]
  - name: red
    thresold_low: [175, 130, 100]
    thresold_high: [180, 255, 255]
  - name: yellow
    thresold_low: [20, 130, 100]
    thresold_high: [60, 255, 255]
```

#### client
Client configuration.
| Key           | Description         | Type |
| ------------- | ------------- | ---- |
| `id`          | Client identifier string   | String |
| `video_source`| Index of the local video source used by OpenCV  | Integer |

#### broker
MQTT Broker configuration.
| Key           | Description         | Type |
| ------------- | ------------- | ---- |
| `url`         | URL to the MQTT broker   | String |
| `port`        | Port to the MQTT broker  | Integer |
| `topic`       | MQTT Topic to publish events to  | String |
#### colors
Array of colors to scan for.
| Key               | Description         | Type |
| -------------     | ------------- | ---- |
| `name`            | Color name used in event string   | String |
| `thresold_low`    | Lower boundary of the color thresold in HSV color space | HSV color array |
| `thresold_high`   | Upper boundary of the color thresold in HSV color space | HSV color array |

A HSV color array consists of the following elements
| Key           | Description         | Type | Value |
| ------------- | ------------- | ---- | --- |
| `Hue`         | Color hue    | Integer | `[0-x]` |
| `Saturation`  | Color saturation   | Integer | `[0-255]` |
| `Value`       | Color value (proportion of black)  | Integer | `[0-255]` |

For more information on HSV colors in OpenCV see xxx.

## Server
The server is a dockerized application which handles the retreival and storage of color detection events and offers them via a REST API.

### Persistence
The server offers two persistence modes
- SQLite
- MySQL

SQLite is enabled by default, to use MySQL set the MYSQL_* environment variables.</br>
:warning: Warning: Events are lost on container stop unless a volume is mounted to the directory containing `/etc/events/events.db`
### Environment Variables
The following environment variables can be set on container run. The `MYSQL_*` variables are optional.
| Key               | Description         | Type |
| -------------     | -------------       | ---- |
| `MQTT_HOST`       | URL to the MQTT broker   | String |
| `MQTT_TOPIC`      | MQTT Topic to receive events from | String |
| `API_USER`        | API user (basic auth) | String |
| `API_PASSWORD`    | API password (basic auth) | String |
| `MYSQL_HOST`      | MySQL database host name | String |
| `MYSQL_USER`      | MySQL database user | String |
| `MYSQL_PASSWORD`  | MySQL database password | String |
| `MYSQL_DB`        | MySQL database name | String |


### Rest API
The documentation for the API can be found [here](LINK).

