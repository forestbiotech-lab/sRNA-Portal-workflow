USE sRNAPlantPortal;
SET FOREIGN_KEY_CHECKS=0;

ALTER TABLE `Gene` DROP FOREIGN KEY `Gene_fk0`;

ALTER TABLE `Gene` DROP FOREIGN KEY `Gene_fk1`;

ALTER TABLE `Genome` DROP FOREIGN KEY `Genome_fk0`;

ALTER TABLE `Hairpin_structure` DROP FOREIGN KEY `Hairpin_structure_fk0`;

ALTER TABLE `Interaction` DROP FOREIGN KEY `Interaction_fk0`;

ALTER TABLE `Interaction` DROP FOREIGN KEY `Interaction_fk1`;

ALTER TABLE `Interaction` DROP FOREIGN KEY `Interaction_fk2`;

ALTER TABLE `Interaction` DROP FOREIGN KEY `Interaction_fk3`;

ALTER TABLE `Study` DROP FOREIGN KEY `Study_fk0`;

ALTER TABLE `Study` DROP FOREIGN KEY `Study_fk1`;

ALTER TABLE `Study` DROP FOREIGN KEY `Study_fk2`;

ALTER TABLE `Assay` DROP FOREIGN KEY `Assay_fk0`;

ALTER TABLE `Annotation` DROP FOREIGN KEY `Annotation_fk0`;

ALTER TABLE `Annotation` DROP FOREIGN KEY `Annotation_fk1`;

ALTER TABLE `Annotation` DROP FOREIGN KEY `Annotation_fk2`;

ALTER TABLE `Annotation` DROP FOREIGN KEY `Annotation_fk3`;

ALTER TABLE `Annotation` DROP FOREIGN KEY `Annotation_fk4`;

ALTER TABLE `Classification` DROP FOREIGN KEY `Classification_fk0`;

ALTER TABLE `Precursor_sequence` DROP FOREIGN KEY `Precursor_sequence_fk0`;

ALTER TABLE `Precursor_sequence` DROP FOREIGN KEY `Precursor_sequence_fk1`;

ALTER TABLE `Precursor_sequence` DROP FOREIGN KEY `Precursor_sequence_fk2`;

ALTER TABLE `Validation` DROP FOREIGN KEY `Validation_fk0`;

ALTER TABLE `Validation` DROP FOREIGN KEY `Validation_fk1`;

ALTER TABLE `Degradome` DROP FOREIGN KEY `Degradome_fk0`;

ALTER TABLE `Transcriptome_sequences` DROP FOREIGN KEY `Transcriptome_sequences_fk0`;

ALTER TABLE `Genome_sequences` DROP FOREIGN KEY `Genome_sequences_fk0`;

ALTER TABLE `Degradome_sequences` DROP FOREIGN KEY `Degradome_sequences_fk0`;

ALTER TABLE `Is_star` DROP FOREIGN KEY `Is_star_fk0`;

ALTER TABLE `Is_star` DROP FOREIGN KEY `Is_star_fk1`;

ALTER TABLE `Is_precursor` DROP FOREIGN KEY `Is_precursor_fk0`;

ALTER TABLE `Is_precursor` DROP FOREIGN KEY `Is_precursor_fk1`;

ALTER TABLE `Expression` DROP FOREIGN KEY `Expression_fk0`;

ALTER TABLE `Expression` DROP FOREIGN KEY `Expression_fk1`;

DROP TABLE IF EXISTS `Gene`;

DROP TABLE IF EXISTS `Genome`;

DROP TABLE IF EXISTS `SRNA_sequence`;

DROP TABLE IF EXISTS `Hairpin_structure`;

DROP TABLE IF EXISTS `Interaction`;

DROP TABLE IF EXISTS `Transcriptome`;

DROP TABLE IF EXISTS `Study`;

DROP TABLE IF EXISTS `Assay`;

DROP TABLE IF EXISTS `Organism`;

DROP TABLE IF EXISTS `Annotation`;

DROP TABLE IF EXISTS `Classification`;

DROP TABLE IF EXISTS `Precursor_sequence`;

DROP TABLE IF EXISTS `Hairpin_image`;

DROP TABLE IF EXISTS `Validation`;

DROP TABLE IF EXISTS `Degradome`;

DROP TABLE IF EXISTS `Transcriptome_sequences`;

DROP TABLE IF EXISTS `Genome_sequences`;

DROP TABLE IF EXISTS `Degradome_sequences`;

DROP TABLE IF EXISTS `Library`;

DROP TABLE IF EXISTS `Is_star`;

DROP TABLE IF EXISTS `Provenance`;

DROP TABLE IF EXISTS `Is_precursor`;

DROP TABLE IF EXISTS `Expression`;

CREATE TABLE `Gene` (
	`id` INT NOT NULL,
	`accession` VARCHAR(255) NOT NULL,
	`gene_symbol` VARCHAR(255) NOT NULL,
	`transcriptome` INT NOT NULL,
	`genome` INT NOT NULL,
	`sequence_name` VARCHAR(255) NOT NULL,
	`start_corrdinate` VARCHAR(255) NOT NULL,
	`stop_coordinate` VARCHAR(255) NOT NULL,
	`length` INT NOT NULL,
	PRIMARY KEY (`id`)
);

CREATE TABLE `Genome` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`assembly` VARCHAR(255) NOT NULL,
	`version` VARCHAR(255) NOT NULL,
	`source` VARCHAR(255) NOT NULL,
	`organism` INT NOT NULL,
	PRIMARY KEY (`id`)
);

CREATE TABLE `SRNA_sequence` (
	`id` INT NOT NULL,
	`sequence` VARCHAR(255) NOT NULL,
	`length` INT NOT NULL,
	PRIMARY KEY (`id`)
);

CREATE TABLE `Hairpin_structure` (
	`id` INT NOT NULL,
	`dot_and_bracket` VARCHAR(255) NOT NULL,
	`hairpin_image` INT NOT NULL,
	`free_energy` INT NOT NULL,
	PRIMARY KEY (`id`)
);

CREATE TABLE `Interaction` (
	`id` INT NOT NULL,
	`type` VARCHAR(255) NOT NULL,
	`annotation` INT NOT NULL,
	`gene` INT NOT NULL,
	`validation` INT NOT NULL,
	`degradome` INT NOT NULL,
	`transcriptome` INT NOT NULL,
	PRIMARY KEY (`id`)
);

CREATE TABLE `Transcriptome` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`assembly` VARCHAR(255) NOT NULL,
	`version` VARCHAR(255) NOT NULL,
	`origin` VARCHAR(255) NOT NULL,
	PRIMARY KEY (`id`)
);

CREATE TABLE `Study` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`Organism` INT NOT NULL,
	`Genome` INT NOT NULL,
	`transcriptome` INT NOT NULL,
	`publicationDOI` VARCHAR(255) NOT NULL,
	`datasetDOI` VARCHAR(255) NOT NULL,
	`author` VARCHAR(255) NOT NULL,
	`institute` VARCHAR(255) NOT NULL,
	PRIMARY KEY (`id`)
);

CREATE TABLE `Assay` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`name` VARCHAR(255) NOT NULL,
	`bioSample_id` VARCHAR(255),
	`study` INT(255),
	PRIMARY KEY (`id`)
);

CREATE TABLE `Organism` (
	`id` INT NOT NULL,
	`ncbi_taxon_id` INT NOT NULL,
	`genus` VARCHAR(255) NOT NULL,
	`species` VARCHAR(255) NOT NULL,
	PRIMARY KEY (`id`)
);

CREATE TABLE `Annotation` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`accession` varchar(255) NOT NULL,
	`name` VARCHAR(255),
	`date` TIMESTAMP,
	`score` VARCHAR(255),
	`library` INT,
	`assay` INT,
	`sRNA` INT NOT NULL,
	`provenance` INT NOT NULL,
	`organism` INT NOT NULL,
	PRIMARY KEY (`id`)
);

CREATE TABLE `Classification` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`type` VARCHAR(255) NOT NULL,
	`version` INT NOT NULL,
	`date` DATE NOT NULL,
	`annotation` INT NOT NULL,
	PRIMARY KEY (`id`)
);

CREATE TABLE `Precursor_sequence` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`genome` INT NOT NULL,
	`length` INT NOT NULL,
	`start_coordinate` INT NOT NULL,
	`end_coordinate` INT NOT NULL,
	`sequence_name` INT NOT NULL,
	`transcriptome` INT NOT NULL,
	`hairpin_struture` INT NOT NULL,
	PRIMARY KEY (`id`)
);

CREATE TABLE `Hairpin_image` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`hairpin_location` VARCHAR(255) NOT NULL,
	PRIMARY KEY (`id`)
);

CREATE TABLE `Validation` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`date` DATE NOT NULL,
	`type` VARCHAR(255) NOT NULL,
	`method` VARCHAR(255) NOT NULL,
	`tool` INT,
	`annotation` INT,
	`interaction` INT,
	PRIMARY KEY (`id`)
);

CREATE TABLE `Degradome` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`organism` INT NOT NULL,
	PRIMARY KEY (`id`)
);

CREATE TABLE `Transcriptome_sequences` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`transcriptome` INT NOT NULL,
	`sequence_name` VARCHAR(255) NOT NULL,
	`sequence` VARCHAR(255) NOT NULL,
	`length` INT NOT NULL,
	PRIMARY KEY (`id`)
);

CREATE TABLE `Genome_sequences` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`genome` INT NOT NULL,
	`sequence_name` VARCHAR(255) NOT NULL,
	`sequence` VARCHAR(255) NOT NULL,
	`length` INT NOT NULL,
	PRIMARY KEY (`id`)
);

CREATE TABLE `Degradome_sequences` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`degradome` INT NOT NULL,
	`sequence_name` VARCHAR(255) NOT NULL,
	`sequence` VARCHAR(255) NOT NULL,
	`length` INT NOT NULL,
	PRIMARY KEY (`id`)
);

CREATE TABLE `Library` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`name` VARCHAR(255) NOT NULL,
	`alias` VARCHAR(255) NOT NULL,
	`hash` VARCHAR(255) NOT NULL,
	`url` VARCHAR(255) NOT NULL,
	`accession` VARCHAR(255) NOT NULL,
	PRIMARY KEY (`id`)
);

CREATE TABLE `Is_star` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`sRNA` INT NOT NULL,
	`star_to` INT NOT NULL,
	PRIMARY KEY (`id`)
);

CREATE TABLE `Provenance` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`external` BINARY NOT NULL,
	`name` VARCHAR(255) NOT NULL,
	`url` VARCHAR(256),
	PRIMARY KEY (`id`)
);

CREATE TABLE `Is_precursor` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`precursor` INT NOT NULL,
	`annotation` INT NOT NULL,
	PRIMARY KEY (`id`)
);

CREATE TABLE `Expression` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`annotation` INT NOT NULL,
	`library` INT NOT NULL,
	`raw` INT NOT NULL,
	`rpm` INT NOT NULL,
	PRIMARY KEY (`id`)
);

ALTER TABLE `Gene` ADD CONSTRAINT `Gene_fk0` FOREIGN KEY (`transcritome`) REFERENCES `Transcriptome`(`id`);

ALTER TABLE `Gene` ADD CONSTRAINT `Gene_fk1` FOREIGN KEY (`genome`) REFERENCES `Genome`(`id`);

ALTER TABLE `Genome` ADD CONSTRAINT `Genome_fk0` FOREIGN KEY (`organism`) REFERENCES `Organism`(`id`);

ALTER TABLE `Hairpin_structure` ADD CONSTRAINT `Hairpin_structure_fk0` FOREIGN KEY (`hairpin_image`) REFERENCES `Hairpin_image`(`id`);

ALTER TABLE `Interaction` ADD CONSTRAINT `Interaction_fk0` FOREIGN KEY (`annotation`) REFERENCES `Annotation`(`id`);

ALTER TABLE `Interaction` ADD CONSTRAINT `Interaction_fk1` FOREIGN KEY (`gene`) REFERENCES `Gene`(`id`);

ALTER TABLE `Interaction` ADD CONSTRAINT `Interaction_fk2` FOREIGN KEY (`validation`) REFERENCES `Validation`(`id`);

ALTER TABLE `Interaction` ADD CONSTRAINT `Interaction_fk3` FOREIGN KEY (`transcriptome`) REFERENCES `Transcriptome`(`id`);

ALTER TABLE `Study` ADD CONSTRAINT `Study_fk0` FOREIGN KEY (`organism`) REFERENCES `Organism`(`id`);

ALTER TABLE `Study` ADD CONSTRAINT `Study_fk1` FOREIGN KEY (`genome`) REFERENCES `Genome`(`id`);

ALTER TABLE `Study` ADD CONSTRAINT `Study_fk2` FOREIGN KEY (`transcriptome`) REFERENCES `Transcriptome`(`id`);

ALTER TABLE `Assay` ADD CONSTRAINT `Assay_fk0` FOREIGN KEY (`study`) REFERENCES `Study`(`id`);

ALTER TABLE `Annotation` ADD CONSTRAINT `Annotation_fk0` FOREIGN KEY (`library`) REFERENCES `Library`(`id`);

ALTER TABLE `Annotation` ADD CONSTRAINT `Annotation_fk1` FOREIGN KEY (`assay`) REFERENCES `Assay`(`id`);

ALTER TABLE `Annotation` ADD CONSTRAINT `Annotation_fk2` FOREIGN KEY (`sRNA`) REFERENCES `sRNA_sequence`(`id`);

ALTER TABLE `Annotation` ADD CONSTRAINT `Annotation_fk3` FOREIGN KEY (`source`) REFERENCES `Provenance`(`id`);

ALTER TABLE `Annotation` ADD CONSTRAINT `Annotation_fk4` FOREIGN KEY (`organism`) REFERENCES `Organism`(`id`);

ALTER TABLE `Classification` ADD CONSTRAINT `Classification_fk0` FOREIGN KEY (`annotation`) REFERENCES `Annotation`(`id`);

ALTER TABLE `Precursor_sequence` ADD CONSTRAINT `Precursor_sequence_fk0` FOREIGN KEY (`genome`) REFERENCES `Genome`(`id`);

ALTER TABLE `Precursor_sequence` ADD CONSTRAINT `Precursor_sequence_fk1` FOREIGN KEY (`transcriptome`) REFERENCES `Transcriptome`(`id`);

ALTER TABLE `Precursor_sequence` ADD CONSTRAINT `Precursor_sequence_fk2` FOREIGN KEY (`hairpin_struture`) REFERENCES `Hairpin_structure`(`id`);

ALTER TABLE `Validation` ADD CONSTRAINT `Validation_fk0` FOREIGN KEY (`annotation`) REFERENCES `Annotation`(`id`);

ALTER TABLE `Validation` ADD CONSTRAINT `Validation_fk1` FOREIGN KEY (`interaction`) REFERENCES `Interaction`(`id`);

ALTER TABLE `Degradome` ADD CONSTRAINT `Degradome_fk0` FOREIGN KEY (`organism`) REFERENCES `Organism`(`id`);

ALTER TABLE `Transcriptome_sequences` ADD CONSTRAINT `Transcriptome_sequences_fk0` FOREIGN KEY (`transcriptome`) REFERENCES `Transcriptome`(`id`);

ALTER TABLE `Genome_sequences` ADD CONSTRAINT `Genome_sequences_fk0` FOREIGN KEY (`genome`) REFERENCES `Genome`(`id`);

ALTER TABLE `Degradome_sequences` ADD CONSTRAINT `Degradome_sequences_fk0` FOREIGN KEY (`degradome`) REFERENCES `Degradome`(`id`);

ALTER TABLE `Is_star` ADD CONSTRAINT `Is_star_fk0` FOREIGN KEY (`sRNA`) REFERENCES `sRNA_sequence`(`id`);

ALTER TABLE `Is_star` ADD CONSTRAINT `Is_star_fk1` FOREIGN KEY (`star_to`) REFERENCES `Annotation`(`id`);

ALTER TABLE `Is_precursor` ADD CONSTRAINT `Is_precursor_fk0` FOREIGN KEY (`precursor`) REFERENCES `Precursor_sequence`(`id`);

ALTER TABLE `Is_precursor` ADD CONSTRAINT `Is_precursor_fk1` FOREIGN KEY (`annotation`) REFERENCES `Annotation`(`id`);

ALTER TABLE `Expression` ADD CONSTRAINT `Expression_fk0` FOREIGN KEY (`annotation`) REFERENCES `Annotation`(`id`);

ALTER TABLE `Expression` ADD CONSTRAINT `Expression_fk1` FOREIGN KEY (`library`) REFERENCES `Library`(`id`);

SET FOREIGN_KEY_CHECKS=1;
