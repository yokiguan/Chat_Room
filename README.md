## 建表代码
### 群组表
```
CREATE TABLE `rooms`(
  `room_id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `room_name` VARCHAR(100) NOT NULL,
  `create_time` timestamp NOT NULL default CURRENT_TIMESTAMP,
  `update_time` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE INDEX (`room_id`)
)ENGINE=InnoDB DEFAULT CHARSET=utf8;
```
1. room_id是rooms表的主键和索引
2. room_name:群组名


### 用户表
```
CREATE TABLE `users`(
  `user_id` int(11) NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `user_name` VARCHAR(100) NOT NULL,
  `password` VARCHAR(100) NOT NULL,
  `create_time` timestamp NOT NULL default CURRENT_TIMESTAMP,
  `update_time` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE INDEX (`user_id`)
)ENGINE=InnoDB DEFAULT CHARSET=utf8;
```
1. user_id:user唯一ID
2. user_name:username
2. password:用户密码密文


### 群组-用户关系表
```
CREATE TABLE `room_users`(
  `room_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `join_time` timestamp NOT NULL default CURRENT_TIMESTAMP,
  `update_time` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE INDEX(`room_id`,`user_id`)
)ENGINE=InnoDB DEFAULT CHARSET=utf8;
```
1. room_id:room唯一ID
2. user_id:user唯一ID


### 记录表
```
CREATE TABLE `records`(
  `record_id` int(11) NOT NULL PRIMARY KEY,
  `content` VARCHAR(1000) NOT NULL,
  `create_time` timestamp NOT NULL default CURRENT_TIMESTAMP,
  `update_time` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE INDEX (`record_id`)
)ENGINE=InnoDB DEFAULT CHARSET=utf8;
```

### 记录-群组-用户关系表
```
CREATE TABLE `record_room_user`(
  `record_id` int(11) NOT NULL PRIMARY KEY,
  `room_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `create_time` timestamp NOT NULL default CURRENT_TIMESTAMP,
  `update_time` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE INDEX (`record_id`)
)ENGINE=InnoDB DEFAULT CHARSET=utf8;
```
## 踩坑记录
1. knex链接mysql异常
   1. 问题现象：knex 链接显示 
`Client does not support authentication protocol requested by server; consider upgrading MySQL client`
   2. 版本：mysql:8.0.18
   3. 解决方法： 换成mysql
2. react ts app 和 nodejs service 分区问题
   1. 偷懒技巧：
      1. `mkdir client`
      2. `cd client`
      3. `create-react-app . --template=typescript`
3. Could not find a declaration file for module '**'
   1. 举个🌰，如果提示Could not find a declaration file for module 'react'，
   2. 那你应该执行如下命令：`yarn add @types/react`
4. nodemon ignore 的部分要加单引号
5. history跳转时socket仍然处于连接中可能会产生多个socket
6. useEffect中有用useState-setState要在return时把他删掉
7. 若要数据库能保存emoji
   1. ALTER DATABASE chat_room CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
   2. ALTER TABLE rooms CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;