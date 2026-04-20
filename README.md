# 鐨焹璇洪绾︾郴缁?

> 涓€涓负楂樻牎瀛︾敓璁捐鐨勪釜浜虹粌鐞村鍦ㄧ嚎棰勭害骞冲彴锛岄噰鐢ㄥ浘涔﹂寮忓嵆鏃堕绾︽満鍒讹細鎻愪氦鍗崇敓鏁堬紝鍏堝埌鍏堝緱锛岄珮骞跺彂瀹夊叏銆?

---

## 鎶€鏈爤

| 灞傛   | 鎶€鏈?                                              |
|------|--------------------------------------------------|
| 鍓嶇   | Vue 3 路 Vite 路 Element Plus 路 Pinia 路 TypeScript |
| 鍚庣   | Spring Boot 3 路 MyBatis 路 JWT                    |
| 鏁版嵁搴? | MySQL 8.0                                        |
| 鍙嶅悜浠ｇ悊 | Nginx 1.28.0                                     |

---

## 椤圭洰缁撴瀯

```
finish3.0/
鈹溾攢鈹€ piano-room-vue3/            # Vue 3 鍓嶇椤圭洰
鈹?  鈹溾攢鈹€ src/
鈹?  鈹?  鈹溾攢鈹€ api/                # Axios 璇锋眰灏佽
鈹?  鈹?  鈹溾攢鈹€ composables/        # useSound 绛夌粍鍚堝紡鍑芥暟
鈹?  鈹?  鈹溾攢鈹€ layouts/            # FrontLayout / AdminLayout
鈹?  鈹?  鈹溾攢鈹€ stores/             # Pinia (auth / settings)
鈹?  鈹?  鈹溾攢鈹€ views/              # 椤甸潰缁勪欢
鈹?  鈹?  鈹斺攢鈹€ main.ts
鈹?  鈹斺攢鈹€ vite.config.ts
鈹溾攢鈹€ music-booking-system/       # Spring Boot 鍚庣椤圭洰
鈹?  鈹斺攢鈹€ src/main/java/com/bookingsystem/
鈹?      鈹溾攢鈹€ controller/         # REST 鎺у埗鍣?
鈹?      鈹溾攢鈹€ service/            # 涓氬姟閫昏緫
鈹?      鈹溾攢鈹€ mapper/             # MyBatis Mapper
鈹?      鈹斺攢鈹€ pojo/               # 瀹炰綋绫?
鈹溾攢鈹€ db/
│   ├── classroombookingdb.sql  # 历史全量初始化脚本（导入到 piano_room_booking）
│   └── piano_room_booking_incremental_migration.sql  # 当前库结构增量迁移脚本
鈹?  鈹斺攢鈹€ conf/nginx.conf         # Nginx 閰嶇疆
鈹斺攢鈹€ docs/
    鈹斺攢鈹€ API.md                  # 鎺ュ彛鏂囨。
```

---

## 鐜瑕佹眰

| 宸ュ叿       | 鐗堟湰瑕佹眰      |
|----------|-----------|
| JDK      | 17+       |
| Maven    | 3.8+      |
| MySQL    | 8.0+      |
| Node.js  | 18+       |
| Nginx    | 1.28.0锛堝凡鍐呯疆锛墊

---

## 蹇€熷惎鍔?

### 1. 鏁版嵁搴撳垵濮嬪寲

鍦?MySQL 8.0 涓墽琛屼互涓嬪懡浠わ細

```sql
CREATE DATABASE piano_room_booking CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE piano_room_booking;
SOURCE db/classroombookingdb.sql;
SOURCE db/piano_room_booking_incremental_migration.sql;
```

> 涔熷彲浠ョ洿鎺ョ敤 Navicat / DBeaver 绛夊伐鍏峰厛瀵煎叆 `db/classroombookingdb.sql`锛屽啀鎵ц `db/piano_room_booking_incremental_migration.sql`銆?
---

### 2. 鍚庣閰嶇疆涓庡惎鍔?

**绗竴姝ワ細淇敼鏁版嵁搴撳瘑鐮?*

鎵撳紑 `music-booking-system/src/main/resources/application.yml`锛屼慨鏀逛互涓嬪瓧娈碉細

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/piano_room_booking?useUnicode=true&characterEncoding=utf-8&serverTimezone=Asia/Shanghai
    username: root
    password: your_password_here   # 鈫?鏀逛负浣犵殑 MySQL 瀵嗙爜
```

**绗簩姝ワ紙鍙€夛級锛氶厤缃偖浠舵湇鍔?*

濡傞渶鍚敤閭欢閫氱煡鍔熻兘锛岀户缁慨鏀?`application.yml`锛?

```yaml
spring:
  mail:
    host: smtp.163.com       # 閭欢鏈嶅姟鍣紝濡?smtp.qq.com / smtp.163.com
    port: 25                 # 绔彛锛圫SL 鐢?465锛孲TARTTLS 鐢?25 鎴?587锛?
    username: your_email@163.com     # 浣犵殑閭璐﹀彿
    password: your_email_auth_code   # 閭鎺堟潈鐮侊紙闈炵櫥褰曞瘑鐮侊紝闇€鍦ㄩ偖绠辫缃腑寮€鍚?SMTP锛?
```

> 涓嶉厤缃偖浠朵篃涓嶅奖鍝嶆牳蹇冮绾﹀姛鑳芥甯镐娇鐢ㄣ€?

**绗笁姝ワ細缂栬瘧骞跺惎鍔?*

```bash
cd music-booking-system
mvn package -DskipTests
java -jar target/classroom-booking-system-0.0.1-SNAPSHOT.jar
```

鍚庣榛樿鐩戝惉 **http://localhost:8099**

---

### 3. 鍓嶇瀹夎涓庢瀯寤?

```bash
cd piano-room-vue3
npm install
npm run build
# 鏋勫缓浜х墿杈撳嚭鍒?piano-room-vue3/dist/
```

> 寮€鍙戞ā寮忥紙鐑洿鏂帮級锛歚npm run dev`锛岄粯璁よ闂?http://localhost:5173

---

### 4. Nginx 閰嶇疆涓庡惎鍔?

**绗竴姝ワ細淇敼 Nginx 閰嶇疆鏂囦欢**

鎵撳紑 `nginx-1.28.0/conf/nginx.conf`锛屾壘鍒?`root` 鎸囦护锛屽皢璺緞鏀逛负鍓嶇鏋勫缓浜х墿鐨勭粷瀵硅矾寰勶細

```nginx
server {
    listen       82;
    
    location / {
        root   D:/nobody/finish3.0/piano-room-vue3/dist;  # 鈫?鏀逛负浣犵殑瀹為檯璺緞
        index  index.html;
        try_files $uri $uri/ /index.html;  # 鏀寔 Vue Router history 妯″紡
    }

    location /api/ {
        proxy_pass http://localhost:8099/;  # 浠ｇ悊鍒板悗绔?
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

**绗簩姝ワ細鍚姩 Nginx**

```bash
# Windows
cd nginx-1.28.0
nginx.exe

# 閲嶈浇閰嶇疆锛堜慨鏀?nginx.conf 鍚庯級
nginx.exe -s reload

# 鍋滄
nginx.exe -s stop
```

鍓嶇榛樿璁块棶鍦板潃锛?*http://localhost:82**

---

## 榛樿璐﹀彿锛堝瘑鐮佸潎涓?`123456`锛?

| 鐢ㄦ埛鍚?       | 绫诲瀷    | 璇存槑         |
|------------|-------|------------|
| student1   | 瀛︾敓    | 娴嬭瘯瀛︾敓璐﹀彿     |
| student2   | 瀛︾敓    | 娴嬭瘯瀛︾敓璐﹀彿     |
| admin1     | 绠＄悊鍛?  | 绠＄悊鍚庡彴璐﹀彿     |
| superadmin | 瓒呯骇绠＄悊鍛?| 鏈€楂樻潈闄愶紝鍙鐞嗙鐞嗗憳 |

---

## 鍔熻兘鐗规€?

### 瀛︾敓绔?

- **鍥句功棣嗗紡鍗虫椂棰勭害**锛氶€夋嫨鐞存埧鍜屾椂娈碉紝鎻愪氦鍗抽攣瀹氾紝鏃犻渶瀹℃牳
- **鏃舵鏌ヨ**锛氫互鏃ュ巻 + 鏂瑰潡褰㈠紡灞曠ず褰撴棩/娆℃棩鍙敤鏃舵锛屽疄鏃跺埛鏂?
- **鎴戠殑棰勭害**锛氭煡鐪嬪巻鍙查绾︼紝鏀寔鍙栨秷灏氭湭寮€濮嬬殑棰勭害
- **涓汉涓績**锛氱疮璁＄粌鐞存椂闀裤€佽繚绾︽鏁般€佸皝绂佺姸鎬佺粺璁?
- **鎻愬墠棰勭害瑙勫垯**锛氬綋鏃ユ椂娈甸殢鏃跺彲棰勶紝娆℃棩鏃舵鍦ㄦ瘡鏃ラ浂鐐瑰悗寮€鏀?

### 绠＄悊绔?

- **棰勭害绠＄悊**锛氭煡鐪嬪叏閮ㄩ绾﹁褰曪紝鏀寔绠＄悊鍛樹粙鍏ュ彇娑?
- **鐢ㄦ埛绠＄悊**锛氭煡鐪嬭繚绾︽鏁?灏佺鐘舵€侊紝鏀寔鎵嬪姩瑙ｅ皝
- **鎯╃綒瑙勫垯閰嶇疆**锛氶樁姊皝绂侊紙绗?娆¤鍛婏紝绗?娆″皝N澶╋紝绗?娆″皝N澶╋級锛岀鐞嗗憳鍙湪鍚庡彴璋冩暣
- **鏁版嵁缁熻**锛氶绾﹁秼鍔裤€佺儹闂ㄦ椂娈点€佺粌鐞存椂闀挎姤琛?
- **绯荤粺璁剧疆**锛氱郴缁熷悕绉般€侀绾︽椂娈佃鍒欙紙寮€濮嬫椂闂?缁撴潫鏃堕棿/鏃堕暱/寮€鏀炬椂闂达級

---

## 杩濈害鏈哄埗

| 杩濈害娆℃暟     | 榛樿澶勭悊    |
|----------|---------|
| 绗?1 娆?   | 绯荤粺璀﹀憡    |
| 绗?2 娆?   | 灏佺 7 澶? |
| 绗?3 娆″強浠ヤ笂 | 灏佺 30 澶?|

> 棰勭害鍚庤秴杩囧紑濮嬫椂闂?10 鍒嗛挓鏈鍒帮紝绯荤粺瀹氭椂浠诲姟鑷姩鏍囪杩濈害銆傜鐞嗗憳鍙湪鍚庡彴璋冩暣灏佺澶╂暟銆?

---

## 骞跺彂瀹夊叏

棰勭害閲囩敤鍙岄噸淇濋殰闃叉瓒呭崠锛?

1. `SELECT ... FOR UPDATE` 鎮茶閿侊紝鍚屼竴鐞存埧鍚屼竴鏃舵鍙厑璁镐竴绗旀垚鍔?
2. 搴旂敤灞傚啿绐佹娴嬶紝澶辫触鏃剁珛鍗宠繑鍥?鏃舵宸茶鎶㈠崰"鎻愮ず

---

## 甯歌闂

**Q锛氬惎鍔ㄥ悗璁块棶椤甸潰鏄剧ず绌虹櫧锛?*  
A锛氭鏌?Nginx `nginx.conf` 涓殑 `root` 璺緞鏄惁姝ｇ‘鎸囧悜 `piano-room-vue3/dist`锛屼笖璺緞浣跨敤姝ｆ枩鏉?`/`銆?

**Q锛氱櫥褰曟姤 500 閿欒锛?*  
A锛氶€氬父鏄暟鎹簱杩炴帴澶辫触銆傛鏌?`application.yml` 涓殑瀵嗙爜鏄惁姝ｇ‘锛屼互鍙?MySQL 鏈嶅姟鏄惁宸插惎鍔ㄣ€?

**Q锛氶偖浠跺彂閫佸け璐ワ紵**  
A锛氱‘璁?`application.yml` 涓殑閭鎺堟潈鐮佹槸鍚︽纭紙鎺堟潈鐮佷笉鏄偖绠辩櫥褰曞瘑鐮侊級锛屼互鍙婇偖绠?SMTP 鍔熻兘鏄惁宸插紑鍚€?

---

## 鎺ュ彛涓庝笂绾挎枃妗?
- 鎺ュ彛鏂囨。锛氳瑙?[docs/API.md](docs/API.md)
- 瀛︽牎绾т笂绾挎暣鏀规竻鍗曪細璇﹁ [docs/瀛︽牎绾т笂绾夸慨澶嶆竻鍗?md](docs/瀛︽牎绾т笂绾夸慨澶嶆竻鍗?md)

