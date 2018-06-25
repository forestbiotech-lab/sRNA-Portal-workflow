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
	`protein_id` INT NOT NULL,
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
	`attribute_list` varchar(254) NOT NULL,
	`attr_id` varchar(254) NOT NULL,
	PRIMARY KEY (`id`)
);

CREATE TABLE `Genome` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`assembly` varchar(254) NOT NULL,
	`external_id` varchar(254) NOT NULL,
	`organism_id` INT NOT NULL,
	`genome_build` varchar(254),
	`genome_build_id` varchar(254),
	PRIMARY KEY (`id`)
);

CREATE TABLE `Pre_miRNA` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`accession` varchar(254) NOT NULL,
	`mature_miRNA_id` INT NOT NULL,
	`description` varchar(254) NOT NULL,
	`feature_id` INT NOT NULL,
	`sequence` VARCHAR(300) NOT NULL,
	PRIMARY KEY (`id`)
);

CREATE TABLE `Mature_miRNA` (
	`id` INT NOT NULL AUTO_INCREMENT,
	`accession` varchar(254) NOT NULL,
	`name` varchar(254) NOT NULL,
	`description` varchar(254),
	`arm` varchar(254) NOT NULL,
	`sequence` varchar(254) NOT NULL,
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
	`species` varchar(254) NOT NULL,
	`sub_species` varchar(254),
	`ncbi_taxon_id` varchar(254) NOT NULL,
	PRIMARY KEY (`id`)
);

ALTER TABLE `Target` ADD CONSTRAINT `Target_fk0` FOREIGN KEY (`mature_miRNA_id`) REFERENCES `Mature_miRNA`(`id`);

ALTER TABLE `Target` ADD CONSTRAINT `Target_fk1` FOREIGN KEY (`transcript_id`) REFERENCES `Transcript`(`id`);

ALTER TABLE `Transcript` ADD CONSTRAINT `Transcript_fk0` FOREIGN KEY (`organism_id`) REFERENCES `Organism`(`id`);

ALTER TABLE `Transcript` ADD CONSTRAINT `Transcript_fk1` FOREIGN KEY (`gene_id`) REFERENCES `Gene`(`id`);

ALTER TABLE `Protein` ADD CONSTRAINT `Protein_fk0` FOREIGN KEY (`gene_id`) REFERENCES `Gene`(`id`);

ALTER TABLE `Gene` ADD CONSTRAINT `Gene_fk0` FOREIGN KEY (`feature_id`) REFERENCES `Feature`(`id`);

ALTER TABLE `Feature` ADD CONSTRAINT `Feature_fk0` FOREIGN KEY (`genome_id`) REFERENCES `Genome`(`id`);

ALTER TABLE `Genome` ADD CONSTRAINT `Genome_fk0` FOREIGN KEY (`organism_id`) REFERENCES `Organism`(`id`);

ALTER TABLE `Pre_miRNA` ADD CONSTRAINT `Pre_miRNA_fk0` FOREIGN KEY (`mature_miRNA_id`) REFERENCES `Mature_miRNA`(`id`);

ALTER TABLE `Pre_miRNA` ADD CONSTRAINT `Pre_miRNA_fk1` FOREIGN KEY (`feature_id`) REFERENCES `Feature`(`id`);

ALTER TABLE `HasStar` ADD CONSTRAINT `HasStar_fk0` FOREIGN KEY (`miRNA_id`) REFERENCES `Mature_miRNA`(`id`);

ALTER TABLE `HasStar` ADD CONSTRAINT `HasStar_fk1` FOREIGN KEY (`star_miRNA_id`) REFERENCES `Mature_miRNA`(`id`);

