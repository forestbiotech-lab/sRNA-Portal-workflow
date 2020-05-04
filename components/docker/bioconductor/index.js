var Docker = require('dockerode');
var docker = new Docker({socketPath: '/var/run/docker.sock'});

const tag = 'bioconductor/bioconductor_docker:devel'

//test if cointainer exists
/*
 {
    Containers: -1,
    Created: 1587753800,
    Id: 'sha256:1bc2f5769aa9cba7c6b74711eed218b552c719cc91a8cd3ee2c4f86b313749b6',
    Labels: {
      description: 'Bioconductor docker image with system dependencies to install most packages.',
      license: 'Artistic-2.0',
      maintainer: 'maintainer@bioconductor.org',
      name: 'bioconductor/bioconductor_docker',
      'org.label-schema.license': 'GPL-2.0',
      'org.label-schema.vcs-url': 'https://github.com/rocker-org/rocker-versioned',
      'org.label-schema.vendor': 'Rocker Project',
      url: 'https://github.com/Bioconductor/bioconductor_docker',
      vendor: 'Bioconductor Project',
      version: '3.11.8'
    },
    ParentId: '',
    RepoDigests: [
      'bioconductor/bioconductor_docker@sha256:2c83f8a1a08958c29400c271ee467fc96919b4db5386cc0b875e6396f071d627'
    ],
    RepoTags: [ 'bioconductor/bioconductor_docker:devel' ],
    SharedSize: -1,
    Size: 3554688526,
    VirtualSize: 3554688526
  }
*/
function imageExist(tag){
  resut=false
  docker.listImages().then(
    data=>{
      data.forEach(datum=>{
        if(datum.RepoTags==tag){
          return true
        }
      })
    },rejection=>{
      return false
    }
  )  
  return result
}

function getImageIDbyTag(){

}

function startImage(){

}

function stopImage(){

}

function importData(){

}
function exportData(){

}
//modify container to have edgeR installed

function createContainer(tag){
  // promises are supported
  const tag = 'bioconductor/bioconductor_docker:devel'
  var auxContainer;
  docker.createContainer({
    Image: tag,
    AttachStdin: false,
    AttachStdout: true,
    AttachStderr: true,
    Tty: true,
    Cmd: ['/bin/bash', '-c', 'tail -f /var/log/dmesg'],
    OpenStdin: false,
    StdinOnce: false
  }).then(function(container) {
    auxContainer = container;
    return auxContainer.start();
  }).then(function(data) {
    return auxContainer.resize({
      h: process.stdout.rows,
      w: process.stdout.columns
    });
  }).then(function(data) {
    return auxContainer.stop();
  }).then(function(data) {
    return auxContainer.remove();
  }).then(function(data) {
    console.log('container removed');
  }).catch(function(err) {
    console.log(err);
  });
}
