DROP TABLE IF EXISTS `Study`;
CREATE TABLE `Study` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`title` varchar(254),
	`responsible` INT(11),
	`description` TEXT(1000),
	`releaseDate` DATE,
	`objective` TEXT(2000),
	`active` BOOLEAN NOT NULL DEFAULT true,
	`public` BOOLEAN NOT NULL DEFAULT false,
	PRIMARY KEY (`id`)
);
DROP TABLE IF EXISTS `Person`;
CREATE TABLE `Person` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`firstName` varchar(254) NOT NULL,
	`lastName` varchar(254) NOT NULL,
	PRIMARY KEY (`id`)
);
DROP TABLE IF EXISTS `Assay`;
CREATE TABLE `Assay` (
	`id` INT(11) NOT NULL AUTO_INCREMENT,
	`name` varchar(255) NOT NULL,
	`study` INT(11) NOT NULL,
	`sample` INT(11),
	`operation` TEXT(1500),
	`type` varchar(254),
	`output` INT,
	PRIMARY KEY (`id`)
);
DROP TABLE IF EXISTS `Assay_data`;
CREATE TABLE `Assay_data` (
	`id` INT(11) NOT NULL AUTO_INCREMENT,
	`assay` INT(11) NOT NULL,
	`raw` INT(11),
	`cpm` FLOAT(11),
	PRIMARY KEY (`id`)
);
DROP TABLE IF EXISTS `Annotation`;
CREATE TABLE `Annotation` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`mature` INT NOT NULL,
	`data` DATETIME NOT NULL,
	`version` INT NOT NULL,
	`assay_data_id` INT NOT NULL,
	PRIMARY KEY (`id`)
);
DROP TABLE IF EXISTS `Factor`;
CREATE TABLE `Factor` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`name` varchar(254) NOT NULL,
	`assay_id` INT(11) NOT NULL,
	PRIMARY KEY (`id`)
);
DROP TABLE IF EXISTS `Modality`;
CREATE TABLE `Modality` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`name` varchar(254) NOT NULL ,
	`factor_id` INT(11) NOT NULL,
	PRIMARY KEY (`id`)
);
DROP TABLE IF EXISTS `Differential_expression`;
CREATE TABLE `Differential_expression` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`logCPM` FLOAT,
	`fTest` FLOAT,
	`logFC` FLOAT,
	`pValue` FLOAT,
	`fdr` FLOAT,
	`study` INT,
	`modality1` INT,
	`modality2` INT,
	`sequence` INT NOT NULL,
	PRIMARY KEY (`id`)
);


ALTER TABLE `Study` ADD CONSTRAINT `Study_fk0` FOREIGN KEY (`responsible`) REFERENCES `Person`(`id`);

ALTER TABLE `Assay` ADD CONSTRAINT `Assay_fk0` FOREIGN KEY (`study`) REFERENCES `Study`(`id`);

ALTER TABLE `Assay` ADD CONSTRAINT `Assay_fk1` FOREIGN KEY (`sample`) REFERENCES `Sample`(`id`);

ALTER TABLE `Assay_data` ADD CONSTRAINT `Assay_data_fk0` FOREIGN KEY (`assay`) REFERENCES `Assay`(`id`);

ALTER TABLE `Annotation` ADD CONSTRAINT `Annotation_fk0` FOREIGN KEY (`mature`) REFERENCES `Mature_miRNA`(`id`);

ALTER TABLE `Annotation` ADD CONSTRAINT `Annotation_fk1` FOREIGN KEY (`assay_data_id`) REFERENCES `Assay_data`(`id`);

ALTER TABLE `Factor` ADD CONSTRAINT `Factor_fk0` FOREIGN KEY (`assay_id`) REFERENCES `Assay`(`id`);

ALTER TABLE `Modality` ADD CONSTRAINT `Modality_fk0` FOREIGN KEY (`factor_id`) REFERENCES `Factor`(`id`);

ALTER TABLE `Differential_expression` ADD CONSTRAINT `Differential_expression_fk0` FOREIGN KEY (`study`) REFERENCES `Study`(`id`);

ALTER TABLE `Differential_expression` ADD CONSTRAINT `Differential_expression_fk1` FOREIGN KEY (`modality1`) REFERENCES `Modality`(`id`);

ALTER TABLE `Differential_expression` ADD CONSTRAINT `Differential_expression_fk2` FOREIGN KEY (`modality2`) REFERENCES `Modality`(`id`);

ALTER TABLE `Differential_expression` ADD CONSTRAINT `Differential_expression_fk3` FOREIGN KEY (`sequence`) REFERENCES `Mature_miRNA_sequence`(`id`);
