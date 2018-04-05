-- MySQL dump 10.11
--
-- Host: localhost    Database: mirna_21a
-- ------------------------------------------------------
-- Server version	5.0.77

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `confidence`
--

DROP TABLE IF EXISTS `confidence`;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
CREATE TABLE `confidence` (
  `mirna_id` varchar(20) NOT NULL default '',
  `auto_mirna` int(10) NOT NULL default '0',
  `exp_count` int(5) NOT NULL default '0',
  `5p_count` double NOT NULL default '0',
  `5p_raw_count` float NOT NULL default '0',
  `3p_count` float NOT NULL default '0',
  `3p_raw_count` float NOT NULL default '0',
  `5p_consistent` float NOT NULL default '0',
  `5p_mature_consistent` decimal(4,0) NOT NULL default '0',
  `3p_consistent` float NOT NULL default '0',
  `3p_mature_consistent` decimal(4,0) NOT NULL default '0',
  `5p_overhang` int(2) default NULL,
  `3p_overhang` int(2) default NULL,
  `energy_precursor` float NOT NULL default '0',
  `energy_by_length` float NOT NULL,
  `paired_hairpin` float NOT NULL default '0',
  `mirdeep_score` double NOT NULL default '0'
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `confidence_score`
--

DROP TABLE IF EXISTS `confidence_score`;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
CREATE TABLE `confidence_score` (
  `auto_mirna` int(10) NOT NULL,
  `confidence` int(2) NOT NULL default '0'
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `dead_mirna`
--

DROP TABLE IF EXISTS `dead_mirna`;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
CREATE TABLE `dead_mirna` (
  `mirna_acc` varchar(9) NOT NULL default '',
  `mirna_id` varchar(40) NOT NULL default '',
  `previous_id` varchar(100) default NULL,
  `forward_to` varchar(20) default NULL,
  `comment` mediumtext
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `experiment`
--

DROP TABLE IF EXISTS `experiment`;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
CREATE TABLE `experiment` (
  `auto_experiment` int(10) unsigned NOT NULL auto_increment,
  `experiment_acc` varchar(20) NOT NULL default '',
  `organism` varchar(10) default NULL,
  `tissu_ontology_id` longtext,
  `technology` longtext,
  `comment` longtext,
  `auto_lit` int(10) unsigned NOT NULL default '0',
  `link` tinytext,
  `mir_read_counts` bigint(20) NOT NULL default '0',
  `all_read_counts` bigint(20) NOT NULL default '0',
  PRIMARY KEY  (`auto_experiment`)
) ENGINE=MyISAM AUTO_INCREMENT=632 DEFAULT CHARSET=latin1;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `experiment_pre_read`
--

DROP TABLE IF EXISTS `experiment_pre_read`;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
CREATE TABLE `experiment_pre_read` (
  `auto_experiment` int(10) unsigned NOT NULL default '0',
  `auto_read` int(20) NOT NULL default '0',
  `count` double NOT NULL default '0',
  `raw_count` int(11) NOT NULL,
  UNIQUE KEY `auto_experiment` (`auto_experiment`,`auto_read`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `literature_references`
--

DROP TABLE IF EXISTS `literature_references`;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
CREATE TABLE `literature_references` (
  `auto_lit` int(10) unsigned NOT NULL auto_increment,
  `medline` int(10) unsigned default NULL,
  `title` tinytext,
  `author` tinytext,
  `journal` tinytext,
  PRIMARY KEY  (`auto_lit`),
  FULLTEXT KEY `text_index` (`title`,`author`)
) ENGINE=MyISAM AUTO_INCREMENT=2424 DEFAULT CHARSET=latin1;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `mature_pre_read`
--

DROP TABLE IF EXISTS `mature_pre_read`;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
CREATE TABLE `mature_pre_read` (
  `auto_read` int(10) unsigned NOT NULL default '0',
  `auto_mature` int(20) NOT NULL default '0',
  UNIQUE KEY `auto_read` (`auto_read`,`auto_mature`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `mature_read_count`
--

DROP TABLE IF EXISTS `mature_read_count`;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
CREATE TABLE `mature_read_count` (
  `auto_mature` int(10) unsigned NOT NULL default '0',
  `mature_acc` varchar(20) NOT NULL default '',
  `read_count` double default NULL,
  `experiment_count` bigint(21) NOT NULL default '0'
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `mature_read_count_by_experiment`
--

DROP TABLE IF EXISTS `mature_read_count_by_experiment`;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
CREATE TABLE `mature_read_count_by_experiment` (
  `auto_mature` int(10) unsigned NOT NULL default '0',
  `mature_acc` varchar(20) NOT NULL default '',
  `read_count` double default NULL,
  `auto_experiment` int(10) NOT NULL default '0'
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `mirna`
--

DROP TABLE IF EXISTS `mirna`;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
CREATE TABLE `mirna` (
  `auto_mirna` int(10) unsigned NOT NULL auto_increment,
  `mirna_acc` varchar(9) NOT NULL default '',
  `mirna_id` varchar(40) NOT NULL default '',
  `previous_mirna_id` text NOT NULL,
  `description` varchar(100) default NULL,
  `sequence` blob,
  `comment` longtext,
  `auto_species` int(10) unsigned NOT NULL default '0',
  PRIMARY KEY  (`auto_mirna`),
  UNIQUE KEY `mirna_acc` (`mirna_acc`),
  KEY `auto_species_inx` (`auto_species`),
  FULLTEXT KEY `comment_index` (`comment`),
  FULLTEXT KEY `description_index` (`description`)
) ENGINE=MyISAM AUTO_INCREMENT=93693 DEFAULT CHARSET=latin1;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `mirna2wikipedia`
--

DROP TABLE IF EXISTS `mirna2wikipedia`;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
CREATE TABLE `mirna2wikipedia` (
  `auto_mirna` int(10) unsigned NOT NULL,
  `auto_wikipedia` int(10) unsigned NOT NULL,
  PRIMARY KEY  (`auto_mirna`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `mirna_2_prefam`
--

DROP TABLE IF EXISTS `mirna_2_prefam`;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
CREATE TABLE `mirna_2_prefam` (
  `auto_mirna` int(10) unsigned NOT NULL default '0',
  `auto_prefam` int(10) unsigned NOT NULL default '0',
  PRIMARY KEY  (`auto_mirna`,`auto_prefam`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `mirna_chromosome_build`
--

DROP TABLE IF EXISTS `mirna_chromosome_build`;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
CREATE TABLE `mirna_chromosome_build` (
  `auto_mirna` int(10) unsigned NOT NULL default '0',
  `xsome` varchar(20) default NULL,
  `contig_start` bigint(20) default NULL,
  `contig_end` bigint(20) default NULL,
  `strand` char(2) default NULL,
  KEY `auto_mirna` (`auto_mirna`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `mirna_context`
--

DROP TABLE IF EXISTS `mirna_context`;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
CREATE TABLE `mirna_context` (
  `auto_mirna` int(10) unsigned NOT NULL default '0',
  `transcript_id` varchar(50) default NULL,
  `overlap_sense` char(2) default NULL,
  `overlap_type` varchar(20) default NULL,
  `number` int(4) default NULL,
  `transcript_source` varchar(50) default NULL,
  `transcript_name` varchar(50) default NULL,
  KEY `auto_mirna_inx` (`auto_mirna`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `mirna_database_links`
--

DROP TABLE IF EXISTS `mirna_database_links`;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
CREATE TABLE `mirna_database_links` (
  `auto_mirna` int(10) unsigned NOT NULL default '0',
  `db_id` tinytext NOT NULL,
  `comment` tinytext,
  `db_link` tinytext NOT NULL,
  `db_secondary` tinytext,
  `other_params` tinytext,
  UNIQUE KEY `mirna_database_links` (`auto_mirna`,`db_id`(50),`db_link`(50))
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `mirna_literature_references`
--

DROP TABLE IF EXISTS `mirna_literature_references`;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
CREATE TABLE `mirna_literature_references` (
  `auto_mirna` int(10) unsigned NOT NULL default '0',
  `auto_lit` int(10) unsigned NOT NULL default '0',
  `comment` mediumtext,
  `order_added` tinyint(4) default NULL
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `mirna_mature`
--

DROP TABLE IF EXISTS `mirna_mature`;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
CREATE TABLE `mirna_mature` (
  `auto_mature` int(10) unsigned NOT NULL auto_increment,
  `mature_name` varchar(40) NOT NULL default '',
  `previous_mature_id` text NOT NULL,
  `mature_acc` varchar(20) NOT NULL default '',
  `evidence` mediumtext,
  `experiment` mediumtext,
  `similarity` mediumtext,
  PRIMARY KEY  (`auto_mature`),
  KEY `mature_name_inx` (`mature_name`),
  KEY `mature_acc_inx` (`mature_acc`)
) ENGINE=MyISAM AUTO_INCREMENT=114965 DEFAULT CHARSET=latin1;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `mirna_pre_mature`
--

DROP TABLE IF EXISTS `mirna_pre_mature`;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
CREATE TABLE `mirna_pre_mature` (
  `auto_mirna` int(10) unsigned NOT NULL default '0',
  `auto_mature` int(10) unsigned NOT NULL default '0',
  `mature_from` varchar(4) default NULL,
  `mature_to` varchar(4) default NULL,
  UNIQUE KEY `auto_mirna_2` (`auto_mirna`,`auto_mature`),
  UNIQUE KEY `auto_mirna_3` (`auto_mirna`,`auto_mature`),
  KEY `auto_mirna` (`auto_mirna`),
  KEY `auto_mature` (`auto_mature`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `mirna_pre_read`
--

DROP TABLE IF EXISTS `mirna_pre_read`;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
CREATE TABLE `mirna_pre_read` (
  `auto_read` int(20) NOT NULL default '0',
  `auto_mirna` int(10) unsigned NOT NULL default '0',
  `position_start` int(10) unsigned NOT NULL default '0',
  `cost_5p` int(2) unsigned NOT NULL default '0',
  `cost_3p` int(2) unsigned NOT NULL default '0',
  `sense` int(1) unsigned NOT NULL default '1',
  UNIQUE KEY `auto_read` (`auto_read`,`auto_mirna`)
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `mirna_prefam`
--

DROP TABLE IF EXISTS `mirna_prefam`;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
CREATE TABLE `mirna_prefam` (
  `auto_prefam` int(10) NOT NULL auto_increment,
  `prefam_acc` varchar(15) NOT NULL default '',
  `prefam_id` varchar(40) NOT NULL default '',
  `description` text,
  PRIMARY KEY  (`auto_prefam`),
  UNIQUE KEY `prefam_acc` (`prefam_acc`),
  UNIQUE KEY `prefam_id` (`prefam_id`)
) ENGINE=MyISAM AUTO_INCREMENT=9142 DEFAULT CHARSET=latin1;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `mirna_read`
--

DROP TABLE IF EXISTS `mirna_read`;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
CREATE TABLE `mirna_read` (
  `auto_read` int(10) unsigned NOT NULL auto_increment,
  `read_acc` varchar(20) NOT NULL default '',
  `sequence` char(100) default NULL,
  `organism` varchar(10) default NULL,
  PRIMARY KEY  (`auto_read`),
  UNIQUE KEY `sequence` (`sequence`,`organism`),
  KEY `read_acc_inx` (`read_acc`),
  KEY `organism_inx` (`organism`)
) ENGINE=MyISAM AUTO_INCREMENT=4394729 DEFAULT CHARSET=latin1;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `mirna_read_count`
--

DROP TABLE IF EXISTS `mirna_read_count`;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
CREATE TABLE `mirna_read_count` (
  `auto_mirna` int(10) unsigned NOT NULL default '0',
  `mirna_acc` varchar(9) NOT NULL default '',
  `read_count` double default NULL,
  `experiment_count` bigint(21) NOT NULL default '0'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `mirna_read_count_by_experiment`
--

DROP TABLE IF EXISTS `mirna_read_count_by_experiment`;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
CREATE TABLE `mirna_read_count_by_experiment` (
  `mirna_acc` varchar(9) NOT NULL default '',
  `read_acc` varchar(20) NOT NULL default '',
  `sequence` char(100) default NULL,
  `experiment_acc` varchar(20) NOT NULL default '',
  `count` double NOT NULL default '0',
  `cost_5p` int(2) unsigned NOT NULL default '0',
  `cost_3p` int(2) unsigned NOT NULL default '0',
  `position_start` int(10) unsigned NOT NULL default '0'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `mirna_read_experiment_count`
--

DROP TABLE IF EXISTS `mirna_read_experiment_count`;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
CREATE TABLE `mirna_read_experiment_count` (
  `auto_mirna` int(10) unsigned NOT NULL default '0',
  `mirna_id` varchar(40) NOT NULL default '',
  `mirna_acc` varchar(9) NOT NULL default '',
  `auto_experiment` int(10) unsigned NOT NULL default '0',
  `experiment_acc` varchar(20) NOT NULL default '',
  `read_count` double default NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `mirna_species`
--

DROP TABLE IF EXISTS `mirna_species`;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
CREATE TABLE `mirna_species` (
  `auto_id` bigint(20) NOT NULL auto_increment,
  `organism` varchar(10) default NULL,
  `division` varchar(10) default NULL,
  `name` varchar(100) default NULL,
  `taxonomy` varchar(200) default NULL,
  `genome_assembly` varchar(50) default '',
  `genome_accession` varchar(50) default '',
  `ensembl_db` varchar(50) default NULL,
  PRIMARY KEY  (`auto_id`),
  UNIQUE KEY `organism` (`organism`)
) ENGINE=MyISAM AUTO_INCREMENT=240 DEFAULT CHARSET=latin1;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `mirna_target_links`
--

DROP TABLE IF EXISTS `mirna_target_links`;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
CREATE TABLE `mirna_target_links` (
  `auto_mature` int(10) unsigned NOT NULL default '0',
  `auto_db` int(10) unsigned NOT NULL default '0',
  `display_name` tinytext NOT NULL,
  `field1` tinytext,
  `field2` tinytext,
  UNIQUE KEY `mirna_target_links` (`auto_mature`,`auto_db`,`display_name`(100))
) ENGINE=MyISAM DEFAULT CHARSET=latin1;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `mirna_target_url`
--

DROP TABLE IF EXISTS `mirna_target_url`;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
CREATE TABLE `mirna_target_url` (
  `auto_db` int(10) unsigned NOT NULL auto_increment,
  `display_name` tinytext NOT NULL,
  `url` tinytext NOT NULL,
  PRIMARY KEY  (`auto_db`)
) ENGINE=MyISAM AUTO_INCREMENT=44 DEFAULT CHARSET=latin1;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `wikipedia`
--

DROP TABLE IF EXISTS `wikipedia`;
SET @saved_cs_client     = @@character_set_client;
SET character_set_client = utf8;
CREATE TABLE `wikipedia` (
  `auto_id` int(10) unsigned NOT NULL auto_increment,
  `title` blob,
  `wp_data` longblob,
  `wp_summary` blob,
  `wp_revision` int(10) unsigned default NULL,
  PRIMARY KEY  (`auto_id`)
) ENGINE=MyISAM AUTO_INCREMENT=89 DEFAULT CHARSET=latin1;
SET character_set_client = @saved_cs_client;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2014-06-25 21:50:51