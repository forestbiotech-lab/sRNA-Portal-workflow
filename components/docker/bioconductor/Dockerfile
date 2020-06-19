# Docker inheritance
FROM bioconductor/bioconductor_docker:latest

ENV origin /home/brunocosta/git/sRNA-Portal-workflow/components/docker/biocondutor/

# Install required Bioconductor package
RUN R -e 'BiocManager::install("edgeR")'
RUN R -e 'install.packages("ggfortify")'
RUN R -e 'install.packages("pheatmap")'
RUN R -e 'install.packages("RColorBrewer")'
RUN R -e 'install.packages("viridis")'
RUN R -e 'install.packages("optparse")'
RUN R -e 'install.packages("svglite")'
RUN R -e 'install.packages("statmod")'
 
WORKDIR /usr/src/app
COPY de.rscript .
