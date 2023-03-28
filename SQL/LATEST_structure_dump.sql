-- MariaDB dump 10.19  Distrib 10.11.2-MariaDB, for Linux (x86_64)
--
-- Host: localhost    Database: sRNA_Plant_Portal
-- ------------------------------------------------------
-- Server version	10.11.2-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `Access`
--

DROP TABLE IF EXISTS `Access`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Access` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `accessOn` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `ipv4` varchar(254) NOT NULL,
  `ipv6` varchar(254) DEFAULT NULL,
  `platform` varchar(254) NOT NULL,
  `valid` tinyint(1) NOT NULL,
  `revokedOn` datetime DEFAULT NULL,
  `city` varchar(254) DEFAULT NULL,
  `country` varchar(254) DEFAULT NULL,
  `accessToken` varchar(254) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `Access_fk0` (`user_id`),
  CONSTRAINT `Access_fk0` FOREIGN KEY (`user_id`) REFERENCES `User` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=124 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Annotation`
--

DROP TABLE IF EXISTS `Annotation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Annotation` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `mature_miRNA_id` int(11) NOT NULL,
  `date` datetime DEFAULT current_timestamp(),
  `version` int(11) NOT NULL,
  `assay_data_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `Annotation_fk0` (`mature_miRNA_id`),
  KEY `Annotation_fk1` (`assay_data_id`)
) ENGINE=InnoDB AUTO_INCREMENT=305675 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Assay`
--

DROP TABLE IF EXISTS `Assay`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Assay` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `study` int(11) NOT NULL,
  `sample` int(11) DEFAULT NULL,
  `operation` text DEFAULT NULL,
  `type` varchar(254) DEFAULT NULL,
  `output` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `Assay_fk0` (`study`),
  KEY `Assay_fk1` (`sample`),
  CONSTRAINT `Assay_fk0` FOREIGN KEY (`study`) REFERENCES `Study` (`id`),
  CONSTRAINT `Assay_fk1` FOREIGN KEY (`sample`) REFERENCES `Sample` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=147 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Assay_Modality`
--

DROP TABLE IF EXISTS `Assay_Modality`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Assay_Modality` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `assay_id` int(11) NOT NULL,
  `modality_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Assay_Modality_u0` (`assay_id`,`modality_id`),
  KEY `Assay_Modality_fk0` (`assay_id`),
  KEY `Assay_Modality_fk1` (`modality_id`),
  CONSTRAINT `Assay_Modality_fk0` FOREIGN KEY (`assay_id`) REFERENCES `Assay` (`id`) ON DELETE CASCADE,
  CONSTRAINT `Assay_Modality_fk1` FOREIGN KEY (`modality_id`) REFERENCES `Modality` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Assay_data`
--

DROP TABLE IF EXISTS `Assay_data`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Assay_data` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `assay` int(11) NOT NULL,
  `mature_miRNA` varchar(254) NOT NULL COMMENT 'mature_miRNA FK',
  `raw` int(11) DEFAULT NULL,
  `cpm` float DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `Assay_data_fk0` (`assay`),
  KEY `mature_miRNA` (`mature_miRNA`),
  CONSTRAINT `Assay_data_fk0` FOREIGN KEY (`assay`) REFERENCES `Assay` (`id`),
  CONSTRAINT `Assay_data_ibfk_1` FOREIGN KEY (`mature_miRNA`) REFERENCES `Mature_miRNA` (`accession`)
) ENGINE=InnoDB AUTO_INCREMENT=305675 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Differential_expression`
--

DROP TABLE IF EXISTS `Differential_expression`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Differential_expression` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `logCPM` float DEFAULT NULL,
  `fTest` float DEFAULT NULL,
  `logFC` float DEFAULT NULL,
  `pValue` float DEFAULT NULL,
  `fdr` float DEFAULT NULL,
  `modality1` int(11) DEFAULT NULL,
  `modality2` int(11) DEFAULT NULL,
  `annotation` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `Differential_expression_fk1` (`modality1`),
  KEY `Differential_expression_fk2` (`modality2`),
  KEY `Differential_expression_fk3` (`annotation`),
  CONSTRAINT `Differential_expression_fk1` FOREIGN KEY (`modality1`) REFERENCES `Modality` (`id`),
  CONSTRAINT `Differential_expression_fk2` FOREIGN KEY (`modality2`) REFERENCES `Modality` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Factor`
--

DROP TABLE IF EXISTS `Factor`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Factor` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(254) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Feature`
--

DROP TABLE IF EXISTS `Feature`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Feature` (
  `id` int(11) DEFAULT NULL,
  `accession` varchar(254) NOT NULL,
  `name` varchar(254) NOT NULL,
  `source` varchar(254) NOT NULL,
  `type` varchar(254) NOT NULL,
  `start` int(254) DEFAULT NULL,
  `end` int(254) DEFAULT NULL,
  `score` float DEFAULT NULL,
  `strand` varchar(1) DEFAULT NULL,
  `phase` int(1) DEFAULT NULL,
  `sequence_assembly_key` varchar(254) NOT NULL,
  `sequence_assembly_value` varchar(254) NOT NULL,
  PRIMARY KEY (`accession`),
  KEY `sequence_assembly_key` (`sequence_assembly_key`,`sequence_assembly_value`),
  CONSTRAINT `Feature_ibfk_1` FOREIGN KEY (`sequence_assembly_key`, `sequence_assembly_value`) REFERENCES `Sequence_assembly` (`assembly_key`, `assembly_value`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Feature_attribute_list`
--

DROP TABLE IF EXISTS `Feature_attribute_list`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Feature_attribute_list` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `accession` varchar(254) NOT NULL,
  `key` varchar(254) NOT NULL,
  `value` varchar(254) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=30911 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Temporary table structure for view `Feature_composite`
--

DROP TABLE IF EXISTS `Feature_composite`;
/*!50001 DROP VIEW IF EXISTS `Feature_composite`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `Feature_composite` AS SELECT
 1 AS `id`,
  1 AS `name`,
  1 AS `source`,
  1 AS `type`,
  1 AS `start`,
  1 AS `end`,
  1 AS `score`,
  1 AS `strand`,
  1 AS `phase`,
  1 AS `accession`,
  1 AS `sequence_assembly_key`,
  1 AS `sequence_assembly_value`,
  1 AS `composite` */;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `Gene`
--

DROP TABLE IF EXISTS `Gene`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Gene` (
  `id` int(11) NOT NULL COMMENT 'gene id from Gene DB NCBI',
  `symbol` varchar(254) NOT NULL,
  `summary` varchar(254) DEFAULT NULL COMMENT 'A human readable description of the seqeunce',
  `xref` varchar(254) NOT NULL COMMENT 'A link to a page with more meradata',
  `full name` varchar(254) DEFAULT NULL COMMENT 'Official Full name in Gene db NCBI',
  `type` int(11) DEFAULT NULL COMMENT 'Describes the gene type ex: Protein Coding',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `HasStar`
--

DROP TABLE IF EXISTS `HasStar`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `HasStar` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `miRNA_id` int(11) NOT NULL,
  `star_miRNA_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `HasStar_fk0` (`miRNA_id`),
  KEY `HasStar_fk1` (`star_miRNA_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Has_user_with_role`
--

DROP TABLE IF EXISTS `Has_user_with_role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Has_user_with_role` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `role` enum('admin','curator','researcher') NOT NULL,
  `person` int(11) NOT NULL,
  `user` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `has_user_with_role_fk0` (`person`),
  KEY `has_user_with_role_fk1` (`user`),
  CONSTRAINT `has_user_with_role_fk0` FOREIGN KEY (`person`) REFERENCES `Person` (`id`),
  CONSTRAINT `has_user_with_role_fk1` FOREIGN KEY (`user`) REFERENCES `User` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Managed_by`
--

DROP TABLE IF EXISTS `Managed_by`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Managed_by` (
  `id` int(10) NOT NULL AUTO_INCREMENT,
  `study` int(10) NOT NULL,
  `person` int(10) NOT NULL,
  `scope` enum('creator','curator','editor') NOT NULL,
  PRIMARY KEY (`id`),
  KEY `person` (`person`),
  KEY `study` (`study`),
  CONSTRAINT `Managed_by_ibfk_1` FOREIGN KEY (`person`) REFERENCES `Person` (`id`),
  CONSTRAINT `Managed_by_ibfk_2` FOREIGN KEY (`study`) REFERENCES `Study` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Mature_has_Pre`
--

DROP TABLE IF EXISTS `Mature_has_Pre`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Mature_has_Pre` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `mature_miRNA` varchar(254) NOT NULL,
  `pre_miRNA` varchar(254) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `pre_miRNA` (`pre_miRNA`),
  KEY `mature_miRNA` (`mature_miRNA`),
  CONSTRAINT `Mature_has_Pre_ibfk_1` FOREIGN KEY (`pre_miRNA`) REFERENCES `Pre_miRNA` (`accession`),
  CONSTRAINT `Mature_has_Pre_ibfk_2` FOREIGN KEY (`mature_miRNA`) REFERENCES `Mature_miRNA` (`accession`)
) ENGINE=InnoDB AUTO_INCREMENT=1868 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Mature_miRNA`
--

DROP TABLE IF EXISTS `Mature_miRNA`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Mature_miRNA` (
  `accession` varchar(254) NOT NULL,
  `name` varchar(254) NOT NULL,
  `family` int(6) DEFAULT NULL,
  `lettered_suffix` varchar(3) DEFAULT NULL,
  `numbered_suffix` int(3) DEFAULT NULL,
  `description` varchar(254) DEFAULT NULL,
  `arm` varchar(254) DEFAULT NULL,
  `sequence_id` int(100) NOT NULL,
  `xref` varchar(254) DEFAULT NULL COMMENT 'External reference',
  PRIMARY KEY (`accession`),
  KEY `Mature_miRNA_fk0` (`sequence_id`),
  CONSTRAINT `Mature_miRNA_fk_0` FOREIGN KEY (`sequence_id`) REFERENCES `Mature_miRNA_sequence` (`id`),
  CONSTRAINT `Mature_miRNA_fk_1` FOREIGN KEY (`accession`) REFERENCES `Feature` (`accession`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Mature_miRNA_sequence`
--

DROP TABLE IF EXISTS `Mature_miRNA_sequence`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Mature_miRNA_sequence` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sequence` varchar(30) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sequence` (`sequence`)
) ENGINE=InnoDB AUTO_INCREMENT=37425 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Messenger_RNA`
--

DROP TABLE IF EXISTS `Messenger_RNA`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Messenger_RNA` (
  `id` int(11) NOT NULL COMMENT 'GI in GenBank',
  `gene` int(11) DEFAULT NULL COMMENT 'fk Gene ID (NCBI)',
  `protein` int(11) DEFAULT NULL COMMENT 'fk',
  `description` varchar(254) DEFAULT NULL,
  `accession` varchar(254) DEFAULT NULL COMMENT 'RefSeq unique identifier',
  `xref` varchar(254) DEFAULT NULL COMMENT 'a link to a page with metadata other then refseq or genbank'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Modality`
--

DROP TABLE IF EXISTS `Modality`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Modality` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(254) NOT NULL,
  `factor_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Modality_u0` (`name`,`factor_id`),
  KEY `Modality_fk0` (`factor_id`),
  CONSTRAINT `Modality_fk0` FOREIGN KEY (`factor_id`) REFERENCES `Factor` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Organism`
--

DROP TABLE IF EXISTS `Organism`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Organism` (
  `ncbi_taxon_id` int(11) NOT NULL,
  `abbreviation` varchar(3) NOT NULL,
  `common_name` varchar(254) DEFAULT NULL,
  `genus` varchar(254) NOT NULL,
  `specific_name` varchar(254) DEFAULT NULL,
  `subspecific_name_key` varchar(254) DEFAULT NULL,
  `subspecific_name_value` varchar(254) DEFAULT NULL,
  PRIMARY KEY (`ncbi_taxon_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Person`
--

DROP TABLE IF EXISTS `Person`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Person` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `orcid` varchar(254) DEFAULT NULL,
  `firstName` varchar(254) NOT NULL,
  `lastName` varchar(254) NOT NULL,
  `institutional_address` varchar(254) DEFAULT NULL,
  `email` varchar(254) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=75 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Pre_miRNA`
--

DROP TABLE IF EXISTS `Pre_miRNA`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Pre_miRNA` (
  `id` int(11) NOT NULL,
  `accession` varchar(254) NOT NULL,
  `name` varchar(254) DEFAULT NULL,
  `family` int(6) DEFAULT NULL,
  `lettered_suffix` varchar(3) DEFAULT NULL,
  `numbered_suffix` int(3) DEFAULT NULL,
  `description` varchar(254) NOT NULL,
  `sequence_id` int(20) NOT NULL,
  PRIMARY KEY (`accession`),
  KEY `Pre_miRNA_fk2` (`sequence_id`),
  CONSTRAINT `Pre_miRNA_fk0` FOREIGN KEY (`accession`) REFERENCES `Feature` (`accession`),
  CONSTRAINT `Pre_miRNA_fk2` FOREIGN KEY (`sequence_id`) REFERENCES `Pre_miRNA_sequence` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Pre_miRNA_sequence`
--

DROP TABLE IF EXISTS `Pre_miRNA_sequence`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Pre_miRNA_sequence` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sequence` varchar(700) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1820 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Profile`
--

DROP TABLE IF EXISTS `Profile`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Profile` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` varchar(254) NOT NULL,
  `profile` varchar(254) NOT NULL,
  `table` varchar(254) NOT NULL,
  `columnName` varchar(254) NOT NULL,
  `fileColumnIndex` int(20) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Protein`
--

DROP TABLE IF EXISTS `Protein`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Protein` (
  `id` int(11) NOT NULL,
  `gene_id` int(11) NOT NULL,
  `protein_id` varchar(254) NOT NULL,
  `gi` varchar(254) NOT NULL,
  `name` varchar(254) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Sample`
--

DROP TABLE IF EXISTS `Sample`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Sample` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `Sample` binary(1) NOT NULL,
  `processed_by` varchar(254) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Sequence_assembly`
--

DROP TABLE IF EXISTS `Sequence_assembly`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Sequence_assembly` (
  `assembly_key` varchar(254) NOT NULL,
  `assembly_value` varchar(254) NOT NULL,
  `organism` int(11) NOT NULL,
  `external_id_key` varchar(254) NOT NULL,
  `external_id_value` varchar(254) NOT NULL,
  `project_key` varchar(254) DEFAULT NULL,
  `project_value` varchar(254) DEFAULT NULL,
  `genome_build` varchar(254) NOT NULL,
  `assembly_date` date NOT NULL,
  `assembly_level` enum('genome','chromosome','scaffold','contig') NOT NULL,
  `representation` enum('full','partial') NOT NULL,
  PRIMARY KEY (`assembly_key`,`assembly_value`),
  KEY `Genome_fk0` (`organism`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Temporary table structure for view `Sequence_assembly_composite`
--

DROP TABLE IF EXISTS `Sequence_assembly_composite`;
/*!50001 DROP VIEW IF EXISTS `Sequence_assembly_composite`*/;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
/*!50001 CREATE VIEW `Sequence_assembly_composite` AS SELECT
 1 AS `assembly_key`,
  1 AS `assembly_value`,
  1 AS `organism`,
  1 AS `external_id_key`,
  1 AS `external_id_value`,
  1 AS `project_key`,
  1 AS `project_value`,
  1 AS `genome_build`,
  1 AS `assembly_date`,
  1 AS `assembly_level`,
  1 AS `representation`,
  1 AS `composite` */;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `Study`
--

DROP TABLE IF EXISTS `Study`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Study` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(254) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `releaseDate` date DEFAULT NULL,
  `objective` text DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT 1,
  `public` tinyint(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Table_access`
--

DROP TABLE IF EXISTS `Table_access`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Table_access` (
  `id` int(100) NOT NULL AUTO_INCREMENT,
  `name` varchar(254) NOT NULL COMMENT 'Name of a table for public access',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Target`
--

DROP TABLE IF EXISTS `Target`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Target` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `transcript_id` int(11) NOT NULL,
  `mature_miRNA_id` int(11) NOT NULL,
  `study_id` int(11) NOT NULL,
  `date` datetime NOT NULL,
  `version` int(11) NOT NULL,
  `type` varchar(254) NOT NULL DEFAULT 'Cleavage',
  `target_description` text DEFAULT NULL,
  `expectation` float DEFAULT NULL,
  `UPE` float DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `Target_fk0` (`mature_miRNA_id`),
  KEY `Target_fk1` (`transcript_id`),
  KEY `Target_fk2` (`study_id`),
  CONSTRAINT `Target_fk1` FOREIGN KEY (`transcript_id`) REFERENCES `Transcript` (`id`),
  CONSTRAINT `Target_fk2` FOREIGN KEY (`study_id`) REFERENCES `Study` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8437 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Transcript`
--

DROP TABLE IF EXISTS `Transcript`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Transcript` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `accession` varchar(254) NOT NULL,
  `version` int(11) NOT NULL,
  `feature_id` int(11) NOT NULL,
  `xref` varchar(254) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `Transcript_fk0` (`feature_id`),
  CONSTRAINT `Transcript_fk0` FOREIGN KEY (`feature_id`) REFERENCES `Feature` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8449 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `User`
--

DROP TABLE IF EXISTS `User`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `User` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(254) NOT NULL,
  `person` int(11) DEFAULT NULL,
  `hash` varchar(254) NOT NULL,
  `createdOn` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `confirmationToken` varchar(254) NOT NULL,
  `active` tinyint(1) DEFAULT 0,
  `attempt` int(5) DEFAULT 0,
  `ban` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `User_fk0` (`person`),
  CONSTRAINT `User_fk0` FOREIGN KEY (`person`) REFERENCES `Person` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=168 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `Websocket_protocols`
--

DROP TABLE IF EXISTS `Websocket_protocols`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `Websocket_protocols` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` varchar(254) NOT NULL,
  `hash` varchar(254) NOT NULL,
  `date` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=489 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Final view structure for view `Feature_composite`
--

/*!50001 DROP VIEW IF EXISTS `Feature_composite`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_unicode_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`pma`@`172.27.0.2` SQL SECURITY DEFINER */
/*!50001 VIEW `Feature_composite` AS select `Feature`.`id` AS `id`,`Feature`.`name` AS `name`,`Feature`.`source` AS `source`,`Feature`.`type` AS `type`,`Feature`.`start` AS `start`,`Feature`.`end` AS `end`,`Feature`.`score` AS `score`,`Feature`.`strand` AS `strand`,`Feature`.`phase` AS `phase`,`Feature`.`accession` AS `accession`,`Feature`.`sequence_assembly_key` AS `sequence_assembly_key`,`Feature`.`sequence_assembly_value` AS `sequence_assembly_value`,concat(`Feature`.`sequence_assembly_key`,':',`Feature`.`sequence_assembly_value`) AS `composite` from `Feature` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `Sequence_assembly_composite`
--

/*!50001 DROP VIEW IF EXISTS `Sequence_assembly_composite`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_unicode_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`pma`@`172.27.0.2` SQL SECURITY DEFINER */
/*!50001 VIEW `Sequence_assembly_composite` AS select `Sequence_assembly`.`assembly_key` AS `assembly_key`,`Sequence_assembly`.`assembly_value` AS `assembly_value`,`Sequence_assembly`.`organism` AS `organism`,`Sequence_assembly`.`external_id_key` AS `external_id_key`,`Sequence_assembly`.`external_id_value` AS `external_id_value`,`Sequence_assembly`.`project_key` AS `project_key`,`Sequence_assembly`.`project_value` AS `project_value`,`Sequence_assembly`.`genome_build` AS `genome_build`,`Sequence_assembly`.`assembly_date` AS `assembly_date`,`Sequence_assembly`.`assembly_level` AS `assembly_level`,`Sequence_assembly`.`representation` AS `representation`,concat(`Sequence_assembly`.`assembly_key`,':',`Sequence_assembly`.`assembly_value`) AS `composite` from `Sequence_assembly` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-03-27  0:22:28
