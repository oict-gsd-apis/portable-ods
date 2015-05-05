function buildReferenceVis(d, pubDates, forward ) {

    var wWidth = $(window).width();
    var dWidth = wWidth * 0.7;
    var wHeight = $(window).height();
    var dHeight = wHeight * 0.7;

    var m = [20, 20, 20, dWidth/2],
        w = dWidth - m[1] - m[3],
        h = dHeight - m[0] - m[2],
        i = 0,
        root;
    var  boundaryWidth = $("#dialog-visual").width()/2 - 240;

    var tree = d4.layout.tree()
        .size([h, w])
        .separation(function separation(a, b) {
//            console.log(a)
            return (a.parent == b.parent ? 1 : 2) /// a.depth
        });

//tree.children(function children(d) {
//        return d.children;
//    }
//);

    var diagonal = d4.svg.diagonal()
        .projection(function(d) { return [d.y, d.x]; });
    d4.select("#dialog-visual").html("");
    var vis = d4.select("#dialog-visual").append("svg")
        .attr("width", $("#dialog-visual").width())
        .attr("height", dHeight)
        .append("svg:g")
        .attr("transform", "translate(" + $("#dialog-visual").width()/2 + "," +0 + ")");

    var newJSON = {};

    //d4.json("../main.json", function(d){
    //root
    var query = d.responseHeader.params.q;
    query = query.substr(7, query.length-1)
    query = query.substr(0, query.indexOf(" AND "));

    newJSON['name'] = query
    newJSON['children'] = [{name:'Referenced By', children:[]}, {name:'Referencing', children: []}];

    //d4.json("../forward.json", function(forward){
    //forward = d;
    //children of forward
    var refsF = [];
    var BreakException= {};
    d.response.docs.forEach(function(d){
        d.refGA ? d.refGA.forEach(function(e)
        {
            var tmppubDate= '';
            var tmpurl='';
            try {
                pubDates.response.docs.forEach(function(x){
                    var dax = new Date(x.publicationDate);
                    var currx_year = dax.getFullYear();
                    if( e  === x.symbol )  {
                        tmppubDate= currx_year ;
                        tmpurl = x.url;
                        throw BreakException;
                    }
                });
            } catch(ex) {
                if (ex!==BreakException) throw ex;
            }
            if (tmppubDate) {
//                e != query ? refsF.push(tmppubDate + ' ' + e) : null;
                e != query ? refsF.push({'name':/*tmppubDate  + ' ' +*/ e, 'url':tmpurl, 'year': tmppubDate}) : null;
            }
        }) : null;
    })
    var uniqueF = refsF.filter( onlyUnique );

    //children of Backward
    var refsB = [];
    forward.response.docs.forEach(function(d){
        var da = new Date(d.publicationDate);
        var curr_year = da.getFullYear();
        d.currYear= da.getFullYear();;
//        d.symbol != query ? refsB.push(curr_year + ' ' + d.symbol) : null; //janice removed this
        d.symbol != query ? refsB.push({'name': /*curr_year + ' ' +*/d.symbol, 'url': d.url, 'year': d.currYear}) : null; //janice added this
    })
//    var uniqueB = refsB.filter( onlyUnique );


    //populate children to json
    newJSON['children'].forEach(function(d){
        if(d.name=='Referenced By'){
            refsB.forEach(function(e){
                d['children'].push(e)
            })
        }
        if(d.name=='Referencing'){
            refsF.forEach(function(e){
                d['children'].push(e)
            })
        }
    })

    root = newJSON;
    root.x0 = h / 2;
    root.y0 = 0;

    function toggleAll(d) {
        if (d.children) {
            d.children.forEach(toggleAll);
            //toggle(d);
        }
    }

    // Initialize the display to show a few nodes.
    if (root.children[0].children.length === 0 && root.children[1].children.length === 0)
        root.name = root.name + ' (No References Extracted)';
    root.children.forEach(toggleAll);
    //        toggle(root.children[0]);
    //        toggle(root.children[1]);

    update(root);
    //})
    // })

    function update(source) {
        var duration = d4.event && d4.event.altKey ? 5000 : 500;

        // Compute the new tree layout.
        var nodes = tree.nodes(root);

        var year_prevNode;
        var boundaries = [];

        // Normalize for fixed-depth.
        nodes.forEach(function(d) {
            if(d.depth == 0){
                d.x = 200
            }
            if(d.depth == 1){
                d.x= 200
                d.name == 'Referencing' ? d.y = d.depth *-120 : d.name == 'Referenced By' ? d.y = d.depth * 120 : 0;
            } if (d.depth ==2){
                d.parent['name'] == 'Referencing' ? d.y = d.depth *-120 : d.parent['name'] == 'Referenced By' ? d.y = d.depth * 120: 0;

                if(d.year != year_prevNode){
                    boundaries.push({'side': d.parent['name'], 'y': d.x - 20, 'x': d.y, 'year': d.year, "id":i++})
                }
                year_prevNode = d.year
                console.log(boundaries)

            }
//        d.y = d.depth * 180;
        });

        // Update the nodes…
        var node = vis.selectAll("g.node")
            .data(nodes, function(d) { return d.id || (d.id = ++i); })


        //BOUNDARIES BETWEEN REFERENCES //added by Janice so ask her if questions

        var boundary = vis.selectAll("g.boundary")
            .data(boundaries, function(d) { return d.id || (d.id = ++i); })

        var boundaryEnter = boundary.enter()
            .append("svg:g")
            .attr('class','boundary');

        boundaryEnter
            .append("svg:rect")
            .attr("x", function(d){
                if(d.side == "Referencing"){
                    return d.x - boundaryWidth;
                }
                else{
                    return d.x
                }
            })
            .attr("y", function(d){ return d.y})
            .attr("width", boundaryWidth)
            .attr("height", 1)
            .attr("fill",'#e6e6e6')
            .style("opacity", 0)
            .transition()
            .duration(500)
            .style('opacity',1);

        boundaryEnter.append("svg:text")
            .attr("x", function(d){
                if(d.side == "Referencing"){
                    return d.x - boundaryWidth;
                }
                else{
                    return d.x + boundaryWidth;
                }
            })
            .attr("y", function(d){return d.y + 12})
            .attr("text-anchor", function(d){
                if(d.side == "Referencing"){
                    return "start"
                } else{
                    return "end"
                }
            })
            .text(function(d){console.log(d.year); return d.year})
            .style("fill", '#b3b3b3')
            .style("font-size", "9px")
            .style("opacity", 0)
            .transition()
            .duration(500)
            .style('opacity',1)


        // Enter any new nodes at the parent's previous position.
        var nodeEnter = node.enter().append("svg:g")
                .attr("class", function(d){
                    if(d.depth ==0){return "node central"}
                    else{return "node"}
                })
                .attr("transform", function(d) { return "translate(" + source.y0 + "," + source.x0 + ")"; })
                .on("click", function(d) {
                    if(d.depth ==2){
                        //alert("go to url")
                        window.open(d.url, "_blank")
                    }
                    else{
                        toggle(d); update(d);
                    }
                })
            ;

        nodeEnter.append("svg:circle")
            .attr("r", 1e-6)
            .style("fill", function(d) {return d._children ? "lightsteelblue" : "#fff"; })
//        .on("mouseover", function(d){
//            d4.select(this).style("fill", 'red')
//            console.log(this)
//        })
//        .on("mouseout", function(d){
//            d4.select(this).transition(duration,500).style("fill", 'white')
//        })

        nodeEnter.append("svg:text")
            .attr("x", function(d) {return d.children || d._children ? 0 : d.parent['name'] == 'Referencing' ? -10 : 10; })
            .attr("dy", function(d){
                if(d.depth == 0 ){
                    return -30
                }
                else if(d.depth == 1){
                    return 40
                }else {
                    return ".35em"
                }
            })
            .attr("text-anchor", function(d) {
                if(d.depth == 0 ){
                    return "middle"
                }
                else if(d.depth == 1){
                    return "middle"
                }else if (d.parent['name'] == 'Referencing'){
                    return "end"
                }else{
//                return "start"
                    return d.children || d._children ? "end" : "start";
                }
            })
            .text(function(d) {return d.name; })
            .style('cursor', 'default')
            .style("fill-opacity", 1e-6)



        // Transition nodes to their new position.
        var nodeUpdate = node.transition()
            .duration(duration)
            .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

        nodeUpdate.select("circle")
            .attr("r", function(d){
                if(d.depth >0){
                    if(d.children){
                        return d.children.length * 3
                    } if(d._children){
                        return d._children.length * 3
                    } else{
                        return 3
                    }
                } else{
                    return 7 *3
                }
            })
            .style("fill", function(d) { return d._children ? "steelblue" : "#B8CFF5"; });

        nodeUpdate.select("text")
            .style("fill-opacity", 1);

        // Transition exiting nodes to the parent's new position.
        var nodeExit = node.exit().transition()
            .duration(duration)
            .attr("transform", function(d) { return "translate(" + source.y + "," + source.x + ")"; })
            .remove();

        nodeExit.select("circle")
            .attr("r", 1e-6);

        nodeExit.select("text")
            .style("fill-opacity", 1e-6);




        // Update the links…
        var link = vis.selectAll("path.link")
            .data(tree.links(nodes), function(d) { return d.target.id; });

        // Enter any new links at the parent's previous position.
        link.enter().insert("svg:path", "g")
            .attr("class", "link")
//        .attr("stroke-width", function(d){ console.log(d);
//            if(d.target['name']=='Referencing'){
//                if (d.target['children']){return d.target['children'].length}
//                else if (d.target['_children']){return d.target['_children'].length*2}
//            }
//            if(d.target['name']=='Referenced By'){
//                if (d.target['children']){return d.target['children'].length}
//                else if (d.target['_children']){return d.target['_children'].length*2}
//            }
//        })
            .attr("d", function(d) {
                var o = {x: source.x0, y: source.y0};
                return diagonal({source: o, target: o});
            })
            .transition()
            .duration(duration)
            .attr("d", diagonal);

        // Transition links to their new position.
        link.transition()
            .duration(duration)
            .attr("d", diagonal);

        // Transition exiting nodes to the parent's new position.
        link.exit().transition()
            .duration(duration)
            .attr("d", function(d) {
                var o = {x: source.x, y: source.y};
                return diagonal({source: o, target: o});
            })
            .remove();

        // Stash the old positions for transition.
        nodes.forEach(function(d) {
            d.x0 = d.x;
            d.y0 = d.y;
        });

        boundaries.forEach(function(d){
//            d.
        })
    }

    // Toggle children.
    function toggle(d) {
        d3.selectAll("g.boundary").transition().style("opacity",0).remove();

        if (d.children) {
            d._children = d.children;
            d.children = null;
        } else {
            // onclick
            d.children = d._children;
            d._children = null;
        }
    }

    function onlyUnique(value, index, self) {
        return self.indexOf(value) === index;
    }

}