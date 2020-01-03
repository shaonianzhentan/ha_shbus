# ha_shbus
在HA里使用的上海公交车车哦


# 使用方式

```

sensor:
  - platform: ha_shbus
    name: 748路（71路支线3）
    direction: 1
    stop_id: 10
  - platform: ha_shbus
    name: 748路（71路支线3）
    direction: 0
    stop_id: 6

```