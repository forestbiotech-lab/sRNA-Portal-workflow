CREATE TABLE `Sample` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`Sample` BINARY NOT NULL,
	`processed_by` varchar(254) NOT NULL,
	PRIMARY KEY (`id`)
);

CREATE TABLE `Study` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`title` varchar(254),
	`responsible` varchar(254),
	`description` TEXT(254),
	PRIMARY KEY (`id`)
);

CREATE TABLE `Person` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`firstName` varchar(254) NOT NULL,
	`lastName` varchar(254) NOT NULL,
	PRIMARY KEY (`id`)
);

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

CREATE TABLE `Assay_data` (
	`id` INT(11) NOT NULL AUTO_INCREMENT,
	`study` INT(11) NOT NULL,
	`raw` INT(11),
	`cpm` FLOAT(11),
	PRIMARY KEY (`id`)
);

CREATE TABLE `Annotation` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`mature` INT NOT NULL AUTO_INCREMENT,
	`data` DATETIME NOT NULL,
	`version` INT NOT NULL,
	`assay_data_id` INT NOT NULL,
	PRIMARY KEY (`id`)
);

CREATE TABLE `Factor` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`name` varchar(254) NOT NULL,
	`assay_id` INT(11) NOT NULL,
	PRIMARY KEY (`id`)
);

CREATE TABLE `Modality` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`name` varchar(254) NOT NULL AUTO_INCREMENT,
	`factor_id` INT(11) NOT NULL,
	PRIMARY KEY (`id`)
);

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

ALTER TABLE `Assay_data` ADD CONSTRAINT `Assay_data_fk0` FOREIGN KEY (`study`) REFERENCES `Assay`(`id`);

ALTER TABLE `Annotation` ADD CONSTRAINT `Annotation_fk0` FOREIGN KEY (`mature`) REFERENCES `Mature_miRNA`(`id`);

ALTER TABLE `Annotation` ADD CONSTRAINT `Annotation_fk1` FOREIGN KEY (`assay_data_id`) REFERENCES `Assay_data`(`id`);

ALTER TABLE `Factor` ADD CONSTRAINT `Factor_fk0` FOREIGN KEY (`assay_id`) REFERENCES `Assay`(`id`);

ALTER TABLE `Modality` ADD CONSTRAINT `Modality_fk0` FOREIGN KEY (`factor_id`) REFERENCES `Factor`(`id`);

ALTER TABLE `Differential_expression` ADD CONSTRAINT `Differential_expression_fk0` FOREIGN KEY (`study`) REFERENCES `Study`(`id`);

ALTER TABLE `Differential_expression` ADD CONSTRAINT `Differential_expression_fk1` FOREIGN KEY (`modality1`) REFERENCES `Modality`(`id`);

ALTER TABLE `Differential_expression` ADD CONSTRAINT `Differential_expression_fk2` FOREIGN KEY (`modality2`) REFERENCES `Modality`(`id`);

ALTER TABLE `Differential_expression` ADD CONSTRAINT `Differential_expression_fk3` FOREIGN KEY (`sequence`) REFERENCES `Mature_miRNA_sequence`(`id`);
