CREATE TABLE `Target` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`mature_miRNA_id` INT NOT NULL,
	`transcript_id` INT NOT NULL,
	PRIMARY KEY (`id`)
);

CREATE TABLE `Transcript` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`organism_id` INT NOT NULL,
	`version` INT NOT NULL,
	`gene_id` INT NOT NULL,
	PRIMARY KEY (`id`)
);

CREATE TABLE `Protein` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`gene_id` INT NOT NULL,
	`protein_id` varchar(254) NOT NULL,
	`gi` varchar(254) NOT NULL,
	`name` varchar(254) NOT NULL,
	PRIMARY KEY (`id`)
);

CREATE TABLE `Gene` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`feature_id` INT NOT NULL,
	`protein_id` INT NOT NULL AUTO_INCREMENT,
	PRIMARY KEY (`id`)
);

CREATE TABLE `Feature` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`genome_id` INT NOT NULL,
	`name` varchar(254) NOT NULL,
	`source` varchar(254) NOT NULL,
	`type` varchar(254) NOT NULL,
	`start` INT(254) NOT NULL,
	`end` INT(254) NOT NULL,
	`score` FLOAT NOT NULL,
	`strand` varchar(1) NOT NULL,
	`phase` INT(1) NOT NULL,
	`attr_id` varchar(254) NOT NULL,
	PRIMARY KEY (`id`)
);

CREATE TABLE `Genome` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`organism_id` INT NOT NULL,
	`assembly_name` varchar(254) NOT NULL,
	`assembly_key` varchar(254) NOT NULL,
	`external_id_key` varchar(254) NOT NULL,
	`external_id_value` varchar(254) NOT NULL,
	`project_key` varchar(254) NOT NULL,
	`project_value` varchar(254),
	`genome_build` varchar(254),
	PRIMARY KEY (`id`)
);

CREATE TABLE `Pre_miRNA` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`accession` varchar(254) NOT NULL,
	`name` varchar(254),
	`family` INT(6) NOT NULL,
	`numbered_suffix` varchar(3) NOT NULL,
	`lettered_suffix` varchar(1) NOT NULL,
	`description` varchar(254) NOT NULL,
	`feature_id` INT NOT NULL,
	`sequence_id` INT(100) NOT NULL,
	PRIMARY KEY (`id`)
);

CREATE TABLE `Mature_miRNA` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`accession` varchar(254) NOT NULL,
	`name` varchar(254) NOT NULL,
	`family` INT(6) NOT NULL,
	`lettered_sufix` varchar(3) NOT NULL,
	`numbered_sufix` INT(3) NOT NULL,
	`description` varchar(254),
	`arm` varchar(254) NOT NULL,
	`sequence_id` INT(100) NOT NULL,
	PRIMARY KEY (`id`)
);

CREATE TABLE `HasStar` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`miRNA_id` INT NOT NULL,
	`star_miRNA_id` INT NOT NULL,
	PRIMARY KEY (`id`)
);

CREATE TABLE `Organism` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`abbreviation` varchar(3) NOT NULL,
	`common_name` varchar(254),
	`genus` varchar(254) NOT NULL,
	`specific_name` varchar(254) NOT NULL,
	`subspecific_name_key` varchar(254) NOT NULL,
	`subspecific_name_value` varchar NOT NULL,
	`ncbi_taxon_id` varchar(254) NOT NULL,
	PRIMARY KEY (`id`)
);

CREATE TABLE `Mature_miRNA_sequence` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`sequence` varchar(30) NOT NULL UNIQUE,
	PRIMARY KEY (`id`)
);

CREATE TABLE `Pre_miRNA_sequence` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`sequence` varchar(700) NOT NULL UNIQUE,
	PRIMARY KEY (`id`)
);

CREATE TABLE `Feature_attribute_list` (
	`id` INT NOT NULL,
	`feature_id` INT(11) NOT NULL,
	`key` varchar(254) NOT NULL,
	`value` varchar(254) NOT NULL
);

CREATE TABLE `Mature_has_Pre` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`mature_miRNA_id` INT NOT NULL,
	`pre_miRNA_id` INT NOT NULL,
	`feature_id` INT NOT NULL,
	PRIMARY KEY (`id`)
);

CREATE TABLE `Pre_has_Feature` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`pre_miRNA_id` INT NOT NULL,
	`feature_id` INT NOT NULL,
	PRIMARY KEY (`id`)
);

ALTER TABLE `Target` ADD CONSTRAINT `Target_fk0` FOREIGN KEY (`mature_miRNA_id`) REFERENCES `Mature_miRNA`(`id`);

ALTER TABLE `Target` ADD CONSTRAINT `Target_fk1` FOREIGN KEY (`transcript_id`) REFERENCES `Transcript`(`organism_id`);

ALTER TABLE `Transcript` ADD CONSTRAINT `Transcript_fk0` FOREIGN KEY (`organism_id`) REFERENCES `Organism`(`id`);

ALTER TABLE `Transcript` ADD CONSTRAINT `Transcript_fk1` FOREIGN KEY (`gene_id`) REFERENCES `Gene`(`id`);

ALTER TABLE `Protein` ADD CONSTRAINT `Protein_fk0` FOREIGN KEY (`gene_id`) REFERENCES `Gene`(`id`);

ALTER TABLE `Gene` ADD CONSTRAINT `Gene_fk0` FOREIGN KEY (`feature_id`) REFERENCES `Feature`(`id`);

ALTER TABLE `Feature` ADD CONSTRAINT `Feature_fk0` FOREIGN KEY (`genome_id`) REFERENCES `Genome`(`id`);

ALTER TABLE `Genome` ADD CONSTRAINT `Genome_fk0` FOREIGN KEY (`organism_id`) REFERENCES `Organism`(`id`);

ALTER TABLE `Pre_miRNA` ADD CONSTRAINT `Pre_miRNA_fk0` FOREIGN KEY (`feature_id`) REFERENCES `Feature`(`id`);

ALTER TABLE `Pre_miRNA` ADD CONSTRAINT `Pre_miRNA_fk1` FOREIGN KEY (`sequence_id`) REFERENCES `Pre_miRNA_sequence`(`id`);

ALTER TABLE `Mature_miRNA` ADD CONSTRAINT `Mature_miRNA_fk0` FOREIGN KEY (`sequence_id`) REFERENCES `Mature_miRNA_sequence`(`id`);

ALTER TABLE `HasStar` ADD CONSTRAINT `HasStar_fk0` FOREIGN KEY (`miRNA_id`) REFERENCES `Mature_miRNA`(`id`);

ALTER TABLE `HasStar` ADD CONSTRAINT `HasStar_fk1` FOREIGN KEY (`star_miRNA_id`) REFERENCES `Mature_miRNA`(`id`);

ALTER TABLE `Feature_attribute_list` ADD CONSTRAINT `Feature_attribute_list_fk0` FOREIGN KEY (`feature_id`) REFERENCES `Feature`(`id`);

ALTER TABLE `Mature_has_Pre` ADD CONSTRAINT `Mature_has_Pre_fk0` FOREIGN KEY (`mature_miRNA_id`) REFERENCES `Mature_miRNA`(`id`);

ALTER TABLE `Mature_has_Pre` ADD CONSTRAINT `Mature_has_Pre_fk1` FOREIGN KEY (`pre_miRNA_id`) REFERENCES `Pre_miRNA`(`id`);

ALTER TABLE `Mature_has_Pre` ADD CONSTRAINT `Mature_has_Pre_fk2` FOREIGN KEY (`feature_id`) REFERENCES `Feature`(`id`);

ALTER TABLE `Pre_has_Feature` ADD CONSTRAINT `Pre_has_Feature_fk0` FOREIGN KEY (`pre_miRNA_id`) REFERENCES `Pre_miRNA`(`id`);

ALTER TABLE `Pre_has_Feature` ADD CONSTRAINT `Pre_has_Feature_fk1` FOREIGN KEY (`feature_id`) REFERENCES `Feature`(`id`);

