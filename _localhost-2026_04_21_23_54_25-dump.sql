-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: school_map
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `location_images`
--

DROP TABLE IF EXISTS `location_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `location_images` (
  `id` int NOT NULL AUTO_INCREMENT,
  `location_id` int NOT NULL,
  `url` text NOT NULL,
  PRIMARY KEY (`id`),
  KEY `locationImages_location_info_id_fk` (`location_id`),
  CONSTRAINT `locationImages_location_info_id_fk` FOREIGN KEY (`location_id`) REFERENCES `location_info` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=64 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `location_images`
--

LOCK TABLES `location_images` WRITE;
/*!40000 ALTER TABLE `location_images` DISABLE KEYS */;
INSERT INTO `location_images` VALUES (21,1,'https://yyc-map-location-images.oss-cn-beijing.aliyuncs.com/2539451f-28d2-40bb-9be9-ac8bfe2ac912.jpg'),(22,7,'https://yyc-map-location-images.oss-cn-beijing.aliyuncs.com/ba617a9c-7bc4-449d-a886-8aa6b5faed95.jpg'),(23,8,'https://yyc-map-location-images.oss-cn-beijing.aliyuncs.com/b15b5546-9830-46c8-a40a-7c84a74833a9.jpg'),(24,13,'https://yyc-map-location-images.oss-cn-beijing.aliyuncs.com/abc5429c-8aa9-4643-9ea1-cfdd0e8c0b8f.jpg'),(25,14,'https://yyc-map-location-images.oss-cn-beijing.aliyuncs.com/bb2862a0-995f-44a3-b221-2c11bb6179ea.jpg'),(26,15,'https://yyc-map-location-images.oss-cn-beijing.aliyuncs.com/52c91004-727f-463f-8d31-0b8fb3082a59.jpg'),(27,16,'https://yyc-map-location-images.oss-cn-beijing.aliyuncs.com/81cbd878-d4e5-4809-a69c-a910d8b16329.jpg'),(28,17,'https://yyc-map-location-images.oss-cn-beijing.aliyuncs.com/e0ac809e-5721-4421-bb44-5e5195b814fd.jpg'),(29,18,'https://yyc-map-location-images.oss-cn-beijing.aliyuncs.com/99b60b0e-5992-4ccb-a5aa-8c1a9313fcd3.jpg'),(30,18,'https://yyc-map-location-images.oss-cn-beijing.aliyuncs.com/eee231f5-6538-41a0-a2e7-28fbb96867f3.jpg'),(31,19,'https://yyc-map-location-images.oss-cn-beijing.aliyuncs.com/9118ecd1-d91c-443e-80e5-2d8388e72676.jpg'),(32,20,'https://yyc-map-location-images.oss-cn-beijing.aliyuncs.com/ebd653e5-14de-4178-b913-36552a16aa90.jpg'),(33,21,'https://yyc-map-location-images.oss-cn-beijing.aliyuncs.com/1a5e2a70-d5a6-40c1-ae95-f54a8737278a.jpg'),(34,21,'https://yyc-map-location-images.oss-cn-beijing.aliyuncs.com/05c98d3e-dcd8-4f3d-99c0-098b24a50cb0.jpg'),(35,22,'https://yyc-map-location-images.oss-cn-beijing.aliyuncs.com/c3e26f34-9d97-4987-a560-16dfec7b0ca5.jpg'),(36,25,'https://yyc-map-location-images.oss-cn-beijing.aliyuncs.com/4b6554ba-a7e6-4544-a0bb-2487a9e951f5.jpg'),(37,26,'https://yyc-map-location-images.oss-cn-beijing.aliyuncs.com/de9dbd1b-2fbf-4e3e-8722-47beca290dee.jpg'),(38,27,'https://yyc-map-location-images.oss-cn-beijing.aliyuncs.com/1f525a76-ee66-40b5-a63a-bc8f12698cf1.jpg'),(39,28,'https://yyc-map-location-images.oss-cn-beijing.aliyuncs.com/230befad-8780-4f32-b929-0b2332460e19.jpg'),(40,23,'https://yyc-map-location-images.oss-cn-beijing.aliyuncs.com/3e7c96fe-7b33-43b4-a8d2-47bcb25fdd1c.jpg'),(41,29,'https://yyc-map-location-images.oss-cn-beijing.aliyuncs.com/8c338150-58a9-46b2-8ec2-90b09d541bb8.jpg'),(42,29,'https://yyc-map-location-images.oss-cn-beijing.aliyuncs.com/ba092470-6f1f-429e-9114-485f8c0f1431.jpg'),(43,30,'https://yyc-map-location-images.oss-cn-beijing.aliyuncs.com/e5750106-4a9e-4634-a6c9-f8f0ad869476.jpg'),(44,31,'https://yyc-map-location-images.oss-cn-beijing.aliyuncs.com/ab8d9dee-5213-4e4d-9dc6-200e66e7a37a.jpg'),(45,32,'https://yyc-map-location-images.oss-cn-beijing.aliyuncs.com/2db89dc0-9dc9-48e5-9166-b498412de6e4.jpg'),(46,33,'https://yyc-map-location-images.oss-cn-beijing.aliyuncs.com/0f34ba24-69b3-4fcd-b2d8-60fe39d3c95b.jpg'),(47,34,'https://yyc-map-location-images.oss-cn-beijing.aliyuncs.com/f69bc99f-21de-4c1a-8ae1-9df05fa3887f.jpg'),(48,35,'https://yyc-map-location-images.oss-cn-beijing.aliyuncs.com/f70d4e44-110d-43ea-ad46-08f83a996c8c.jpg'),(49,36,'https://yyc-map-location-images.oss-cn-beijing.aliyuncs.com/93381a12-c81d-46d3-8757-ed16f745e19d.jpg'),(50,37,'https://yyc-map-location-images.oss-cn-beijing.aliyuncs.com/716b7a1b-7719-4fa1-8671-024c89897b6f.jpg'),(51,37,'https://yyc-map-location-images.oss-cn-beijing.aliyuncs.com/6dfbb33e-4d6b-4c8a-8bd6-368ad75626fb.jpg'),(54,40,'https://yyc-map-location-images.oss-cn-beijing.aliyuncs.com/3840cd4d-1465-44d2-aa04-5bd1b264aa16.png'),(55,41,'https://yyc-map-location-images.oss-cn-beijing.aliyuncs.com/bef1a2c1-c4d9-4009-866d-60d163418e8a.jpg'),(56,41,'https://yyc-map-location-images.oss-cn-beijing.aliyuncs.com/81ca3673-adaf-4975-8295-ea668c461087.jpg'),(61,41,'https://yyc-map-location-images.oss-cn-beijing.aliyuncs.com/cacbc846-d156-4898-9f25-62c9f4ad5fed.jpg');
/*!40000 ALTER TABLE `location_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `location_info`
--

DROP TABLE IF EXISTS `location_info`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `location_info` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(30) NOT NULL,
  `description` text,
  `information` text,
  `longitude` double DEFAULT NULL,
  `latitude` double DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=42 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `location_info`
--

LOCK TABLES `location_info` WRITE;
/*!40000 ALTER TABLE `location_info` DISABLE KEYS */;
INSERT INTO `location_info` VALUES (1,'主五','主楼群5号教学楼','包括网络中心、建筑学院、公共机房、教育技术服务中心等',118.04807,24.3683),(7,'主一','主楼群1号教学楼','包括物理实验室、英语语言文化学院、人文与传播学院等',118.048051,24.36539),(8,'主二','主楼群2号教学楼','公共课程教学楼',118.047727,24.366038),(13,'主三','主楼群3号楼','行政楼，包括各行政单位、保卫部、大报告厅、党群服务中心等',118.04771,24.366919),(14,'主四','主楼群4号楼','厦门大学国际学院',118.047784,24.367666),(15,'公一','公共教学楼1号楼','大报告厅、各实验室、公共课程教学楼、计算机机房等',118.046545,24.364809),(16,'经管','经管大楼','包括会计与金融学院、管理学院、国际商务学院等',118.045586,24.368535),(17,'人文','人文大楼','包括音乐与舞蹈学院、设计与创意学院等',118.045974,24.369617),(18,'理工','理工大楼','包括信息科学与技术学院、机电工程与自动化学院等',118.044702,24.367506),(19,'生化','生化主楼及A、B、C楼','包括实验室、土木工程学院、环境科学与工程学院、厦门大学创意与创新学院、产业技术研究院、古雷石化研究院等',118.043331,24.367355),(20,'北区商场','北区商业综合体','包括北区超市、南强美食城、医务室、各商户等',118.047128,24.375361),(21,'北区食堂',NULL,NULL,118.046274,24.375337),(22,'北区田径场','足球场、操场',NULL,118.045841,24.373859),(23,'学生活动中心','艺术类课程教学楼','音乐与舞蹈学院、公共琴房等',118.043479,24.372686),(24,'学术交流中心','厦门大学创意与创新学院教学楼','宾馆、嘉园餐厅等',118.047669,24.375076),(25,'中区食堂',NULL,NULL,118.045294,24.370534),(26,'南区食堂',NULL,NULL,118.047914,24.361845),(27,'风羽球馆','运动综合楼、体育课教学楼','室内篮球场、羽毛球场、乒乓球室、舞蹈室、健身房等',118.048112,24.373254),(28,'游泳馆','游泳课程教学场馆','游泳馆',118.047892,24.37406),(29,'网球场','网球课程教学场地','室外网球场',118.046474,24.370833),(30,'棒球场','棒球课程教学场地','棒球场',118.049037,24.371581),(31,'匹克球场','匹克球课程教学场地','匹克球场',118.047021,24.373289),(32,'篮球场','篮球课程教学场馆','篮球场',118.04779,24.371697),(33,'南区操场','南区足球场及跑道',NULL,118.048886,24.361454),(34,'高尔夫球场','高尔夫球课程场地',NULL,118.041409,24.366549),(35,'排球场','排球课程详细场地',NULL,118.047093,24.374297),(36,'水上音乐广场','校内大型活动举办场地','校友歌会、新生晚会、校庆等活动举办地',118.042551,24.364712),(37,'陈嘉庚雕像','陈嘉庚纪念雕像',NULL,118.049281,24.366859),(40,'凌云园区','学生宿舍楼群','作为校园海拔最高的宿舍楼，视野绝佳。住在高层，推窗就能远眺山海，同时每栋楼都配有电梯，完全不用担心爬楼问题',118.045973,24.377193),(41,'南强广场','123',NULL,118.047132,24.374881);
/*!40000 ALTER TABLE `location_info` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `pending_review_images`
--

DROP TABLE IF EXISTS `pending_review_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `pending_review_images` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `location_id` int DEFAULT NULL,
  `sub_location_id` int DEFAULT NULL,
  `url` text,
  `time` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `pending_review_images`
--

LOCK TABLES `pending_review_images` WRITE;
/*!40000 ALTER TABLE `pending_review_images` DISABLE KEYS */;
/*!40000 ALTER TABLE `pending_review_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sub_location`
--

DROP TABLE IF EXISTS `sub_location`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sub_location` (
  `id` int NOT NULL AUTO_INCREMENT,
  `location_id` int NOT NULL,
  `name` varchar(30) NOT NULL,
  `introduction` text,
  PRIMARY KEY (`id`),
  KEY `Sub-location_location_info_id_fk` (`location_id`),
  CONSTRAINT `Sub-location_location_info_id_fk` FOREIGN KEY (`location_id`) REFERENCES `location_info` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sub_location`
--

LOCK TABLES `sub_location` WRITE;
/*!40000 ALTER TABLE `sub_location` DISABLE KEYS */;
INSERT INTO `sub_location` VALUES (16,24,'嘉园餐厅',NULL),(17,13,'图书馆','厦门大学嘉庚学院图书馆共有阅览座位3000个，馆藏书近200万册，现刊776种，报纸67种，电子图书近百万种，同时与厦大共享近千万种文献资源。'),(22,20,'商场内部一楼','开设蜜雪冰城、古茗等大牌奶茶店，三大网络运营商，理发店，文具店等店面，满足学生日常生活需求。'),(23,40,'宿舍图片',NULL);
/*!40000 ALTER TABLE `sub_location` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sub_location_images`
--

DROP TABLE IF EXISTS `sub_location_images`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sub_location_images` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sub_location_id` int NOT NULL,
  `url` text NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sub_location_images_sub_location_id_fk` (`sub_location_id`),
  CONSTRAINT `sub_location_images_sub_location_id_fk` FOREIGN KEY (`sub_location_id`) REFERENCES `sub_location` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sub_location_images`
--

LOCK TABLES `sub_location_images` WRITE;
/*!40000 ALTER TABLE `sub_location_images` DISABLE KEYS */;
INSERT INTO `sub_location_images` VALUES (19,16,'https://yyc-map-location-images.oss-cn-beijing.aliyuncs.com/a85895fb-71c5-40f9-b461-149e1d22bd6f.jpg'),(22,17,'https://yyc-map-location-images.oss-cn-beijing.aliyuncs.com/8d318022-e8cd-4b2c-81b0-9723a185164b.jpg'),(23,17,'https://yyc-map-location-images.oss-cn-beijing.aliyuncs.com/07998870-ff5d-41d7-8d2e-b531d10ab7e1.webp'),(27,22,'https://yyc-map-location-images.oss-cn-beijing.aliyuncs.com/d46b128c-c913-416c-a668-8dc102385264.jpg'),(28,22,'https://yyc-map-location-images.oss-cn-beijing.aliyuncs.com/4a2d7357-2011-4a2e-972c-00db18dcd488.jpg'),(29,22,'https://yyc-map-location-images.oss-cn-beijing.aliyuncs.com/ad343c6e-c110-465d-8ce6-cd877e8fc200.jpg'),(30,22,'https://yyc-map-location-images.oss-cn-beijing.aliyuncs.com/17c39661-8e46-43d1-bcbd-cd66f3b67bdb.jpg'),(31,23,'https://yyc-map-location-images.oss-cn-beijing.aliyuncs.com/8b97f5ec-4388-4845-aae4-ad8b4aff687f.webp');
/*!40000 ALTER TABLE `sub_location_images` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(30) NOT NULL,
  `password` varchar(20) NOT NULL,
  `identity` int NOT NULL DEFAULT '0' COMMENT '管理员：1，用户：0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'yyc','123456',1),(5,'xuenkun','123',1),(14,'user','123456',0),(15,'test','123456',0);
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_comment`
--

DROP TABLE IF EXISTS `user_comment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_comment` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `location_id` int NOT NULL,
  `content` text NOT NULL,
  `time` timestamp NOT NULL,
  `needs_review` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_comment_location_info_id_fk` (`location_id`),
  KEY `user_comment_user_id_fk` (`user_id`),
  CONSTRAINT `user_comment_location_info_id_fk` FOREIGN KEY (`location_id`) REFERENCES `location_info` (`id`),
  CONSTRAINT `user_comment_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_comment`
--

LOCK TABLES `user_comment` WRITE;
/*!40000 ALTER TABLE `user_comment` DISABLE KEYS */;
INSERT INTO `user_comment` VALUES (40,5,13,'图书馆真漂亮','2026-04-20 06:04:27',0);
/*!40000 ALTER TABLE `user_comment` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-21 23:54:25
