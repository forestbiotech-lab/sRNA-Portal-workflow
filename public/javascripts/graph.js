
var graph={
  "nodes": [
    {"id": "osa-miR11337-5p", "group": 1},
    {"id": "osa-miR11337-3p", "group": 1},
    {"id": "osa-MIR11337", "group": 6}
  ],
  "links": [
    {"source": "osa-miR11337-5p", "target": "osa-MIR11337", "value": 4},
    {"source": "osa-miR11337-3p", "target": "osa-MIR11337", "value": 4}
  ]
}



var height=600
var width=300

function chart(data,id){
  const links = data.links.map(d => Object.create(d));
  const nodes = data.nodes.map(d => Object.create(d));
  const simulation = forceSimulation(nodes, links).on("tick", ticked);

  const svg = d3.select("svg#"+id)
      .attr("viewBox", [-width / 2, -height / 2, width, height]);

  const link = svg.append("g")
      .attr("stroke", "#999")
      .attr("stroke-opacity", 0.6)
    .selectAll("line")
    .data(links)
    .enter().append("line")
      .attr("stroke-width", d => Math.sqrt(d.value)*2);

  const node = svg.append("g")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
    .selectAll("circle")
    .data(nodes)
    .enter().append("circle")
      .attr("r", 20)
      .attr("fill", color(data))
      .call(drag(simulation));

  node.append("title")
      .text(d => d.id);

  function ticked() {
    link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);
    
    node
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);
  }

  return svg.node();
}

function forceSimulation(nodes, links) {
  return d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id))
      .force("charge", d3.forceManyBody())
      .force("center", d3.forceCenter())
      .force("collision",d3.forceCollide(40));
}

function color(d){
  const scale = d3.scaleOrdinal(d3.schemeCategory10);
  return d => scale(d.group);
}

function drag(simulation){

      function dragstarted(d) {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      }
      
      function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
      }
      
      function dragended(d) {
        if (!d3.event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }
      
      return d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended);

}
function loadChart(data,id){
    chart(data,id)
}