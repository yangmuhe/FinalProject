/**
 * Created by yangmuhe on 12/01/15.
 */
console.log("Final Project");

var margin = {t:20,r:100,b:80,l:30};
var width = document.getElementById('plot').clientWidth - margin.r - margin.l,
    height = document.getElementById('plot').clientHeight - margin.t - margin.b;

var canvas = d3.select('.canvas');
var plot = canvas
    .append('svg')
    .attr('width',width+margin.r+margin.l)
    .attr('height',height + margin.t + margin.b)
    .append('g')
    .attr('class','canvas')
    .attr('transform','translate('+margin.l+','+margin.t+')');

//Scales
var scaleX = d3.scale.linear().domain([1940,2005]).range([0,width]),
    scaleY = d3.scale.linear().domain([0,10]).range([height,0]),
    scaleYlength = d3.scale.linear().domain([0,350]).range([height,0]),
    scaleYbudget = d3.scale.linear().domain([0,200000000]).range([height,0]),
    scaleR = d3.scale.sqrt().domain([0,10]).range([0,10]),
    scaleColor = d3.scale.ordinal()
        .domain([1,2,3,4,5,6,7])
        .range(['rgb(65,179,255)','#9467bd','#74c476','rgb(252,144,33)','red','rgb(255,65,150)','rgb(180,180,180)']);

//Axis
var axisX = d3.svg.axis()
    .orient('bottom')
    .scale(scaleX)
    .tickFormat( d3.format('d') ); //https://github.com/mbostock/d3/wiki/Formatting
var axisY = d3.svg.axis()
    .orient('left')
    .tickSize(width)
    .scale(scaleY);

//Draw axes
plot.append('g').attr('class','axis axis-x')
    .attr('transform','translate(0,'+height+')')
    .call(axisX);

plot.append('g').attr('class','axis axis-y')
    .attr('transform','translate('+width+',0)')
    .call(axisY);


var scatterPlot = plot.append('g').attr('class', 'scatterplot');


var lineGeneratorLength = d3.svg.line()
    .x(function(d){ return scaleX(d.year)})
    .y(function(d){ return scaleYlength(d.length)})
    .interpolate('basis');   //!!!

var lineGeneratorBudget = d3.svg.line()
    .x(function(d){return scaleX(d.year)})
    .y(function(d){return scaleYbudget(d.budget)})
    .interpolate('basis');

var metadata = d3.map();

//Import data
d3.tsv('data/movies.tsv', parse, dataLoaded);

function parse(d){
    var parsedRow = {
        title: d.title,
        year: +d.year,
        rating: +d.rating,
        votes: +d.votes,
        length: +d.length,
        budget: +d.budget,
        action: +d.Action,
        animation: +d.Animation,
        comedy: +d.Comedy,
        drama: +d.Drama,
        documentary: +d.Documentary,
        romance: +d.Romance,
        short: +d.Short,
        uid: +d.u_id

    };
    if(parsedRow.votes > 1000){
        return parsedRow;
    }else{return;}

    if(parsedRow.action==1 || parsedRow.animation==1 || parsedRow.comedy==1 || parsedRow.drama==1 || parsedRow.romance==1 || parsedRow.short==1){
        return parsedRow;
    }else{return;}
}

function genre(d){
    //console.log(d);
    if(d.action == 1){return 1;}
    else if(d.animation == 1){return 2}
    else if(d.comedy == 1){return 3}
    else if(d.drama == 1){return 4}
    else if(d.documentary == 1){return 5}
    else if(d.romance == 1){return 6}
    else{return 7}
}


function dataLoaded(error, data){

    //Sort data before nest, otherwise the sort method doesn't work.
    data.sort(function(a,b){
        return b.rating - a.rating;  //in descending order
    });
    //console.log(data);

    var nestedData = d3.nest()
        .key(function(d){return d.year })
        .entries(data)

    //console.log(nestedData);

    //Draw
    d3.selectAll('.btn-group .year').on('click',function(){

        //Update Y axis
        scaleY = d3.scale.linear().domain([0,10]).range([height,0]);
        axisY.scale(scaleY);
        plot.selectAll('g.axis.axis-y')
            .transition()
            .duration(1500)
            .call(axisY);

        var times = d3.select(this).attr('id');
        console.log("Show movies of each year in the " + times);

        if(times=='1940s'){
            draw(data,1940,1949);
        }else if(times=='1950s'){
            draw(data,1950,1959);
        }else if(times=='1960s'){
            draw(data,1960,1969);
        }else if(times=='1970s'){
            draw(data,1970,1979);
        }else if(times=='1980s'){
            draw(data,1980,1989);
        }else if(times=='1990s'){
            draw(data,1990,1999);
        }else{draw(data,2000,2005)}

    })

    d3.selectAll('.btn-group .producer').on('click',function(){

        //Update X axis
        scaleX = d3.scale.linear().domain([1940,2005]).range([0,width]);
        axisX.scale(scaleX);
        plot.selectAll('g.axis.axis-x')
            .transition()
            .duration(1500)
            .call(axisX);

        var type = d3.select(this).attr('id');
        console.log("Show the changes of " + type + " during 1940 to 2005.");

        if(type=='length'){
            drawL(data);
        }else{
            drawB(data);
        }
    })
}


//Draw time-rating scatterplot
function draw(dataArray,startYear,endYear){

    //Update X axis
    scaleX = d3.scale.linear().domain([startYear,endYear]).range([0,width]);
    axisX.scale(scaleX);
    plot.selectAll('g.axis.axis-x')  //!!!
        .transition()   //animation
        .duration(1500)
        .call(axisX);

    //scaleY = d3.scale.linear().domain([0,10]).range([height,0]);

    var filteredData = dataArray.filter(function(d){ return d.year <= endYear});

    var dots = scatterPlot.selectAll('.data-point')
        .data(filteredData, function(d){return d.uid})   //with key function!

    var dotsEnter = dots.enter()
        .append('g')
        //.filter(function(d){ return d.year <= endYear})
        .attr('class','data-point')
        .attr('transform',function(d){return 'translate('+scaleX(d.year)+','+scaleY(d.rating)+')';})
        .append('circle')
        .attr('r',0)
        //.attr('cx', function(d){return scaleX(d.year)})
        //.attr('cy', function(d){return scaleY(d.rating)})
        .style('fill',function(d){return scaleColor(genre(d));})
        .style('opacity',0.5)
        .call(tooltip)

    dots.exit()
        //.attr('r', 3)
        //.transition()   //not working???
        //.duration(1000)
        //.style('opacity',0)
        .remove();

    dots.transition()
        .duration(1500)
        .attr('transform',function(d){return 'translate('+scaleX(d.year)+','+scaleY(d.rating)+')';})
        .select('circle')
        .attr('r',function(d){return scaleR(d.rating)});
}

//Draw time-length
function drawL(dataArray, scaleYpro){
    //Update axes
    scaleX = d3.scale.linear().domain([1940 ,2005]).range([0,width]);

    //scaleY = d3.scale.linear().domain([0,350]).range([height,0]);
    axisY.scale(scaleYlength);
    plot.selectAll('g.axis.axis-y')
        .transition()
        .duration(1500)
        .call(axisY);

    var filteredData = dataArray.filter(function(d){ return d.year >= 1940});

    var dots = scatterPlot.selectAll('.data-point')
        .data(filteredData, function(d){return d.uid});

    var dotsEnter = dots.enter()
        .append('g')
        //.filter(function(d){ return d.year >= 1940})
        .attr('class','data-point')
        .attr('transform',function(d){return 'translate('+scaleX(d.year)+','+scaleYlength(d.length)+')';})
        .append('circle')
        .attr('r',0)
        .style('fill',function(d){return scaleColor(genre(d));})
        .style('opacity',0.5)
        .call(tooltip)

    dots.exit()
        //.attr('r',3)
        //.transition().duration(500)
        .remove();

    //dots.attr('transform',function(d){return 'translate('+scaleX(d.year)+','+scaleY(d.length)+')';})

    dots.transition()
        .duration(1500)
        .attr('transform',function(d){return 'translate('+scaleX(d.year)+','+scaleYlength(d.length)+')';})
        .select('circle')
        .attr('r',3)

}

//Draw time-budget
function drawB(dataArray, scaleYpro){

    //Update axes
    scaleX = d3.scale.linear().domain([1940 ,2005]).range([0,width]);

    //scaleY = d3.scale.linear().domain([0,200000000]).range([height,0]);
    axisY.scale(scaleYbudget);
    plot.selectAll('g.axis.axis-y')
        .transition()
        .duration(1500)
        .call(axisY);

    var filteredData = dataArray.filter(function(d){ return d.year >= 1940});

    var dots = scatterPlot.selectAll('.data-point')
        .data(filteredData, function(d){return d.uid});

    var dotsEnter = dots.enter()
        .append('g')
        //.filter(function(d){ return d.year >= 1940})
        .attr('class','data-point')
        .attr('transform',function(d){return 'translate('+scaleX(d.year)+','+scaleYbudget(d.budget)+')';})
        .append('circle')
        //.style("display", function(d) { return d.budget == 0 ? "none" : null; })
        .attr('r',0)
        .style('fill',function(d){return scaleColor(genre(d));})
        .style('opacity',0.5)
        .call(tooltip)

    dots.exit()
        .remove();

    //dots.attr('transform',function(d){return 'translate('+scaleX(d.year)+','+scaleY(d.budget)+')';})

    dots.transition()
        .duration(1500)
        .attr('transform',function(d){return 'translate('+scaleX(d.year)+','+scaleYbudget(d.budget)+')';})
        .select('circle')
        .attr('r', function(d){return d.budget == 0 ? 0 : 3; })

}

//Tooltip
//Remember to set up the tooltip box in html file, otherwise there would be nothing in the box
function tooltip(selection){
    selection
        .on('mouseenter',function(d){
            console.log(d.title);
            console.log(d.year);
            console.log(d.rating);

            var tooltip = d3.select('.custom-tooltip');
            tooltip
                .transition()
                .style('opacity',1);

            tooltip.select('#title').html(d.title);
            tooltip.select('#year').html(d.year);
            tooltip.select('#rating').html(d.rating);
            tooltip.select('#length-tooltip').html(d.length);
            tooltip.select('#budget-tooltip').html(d.budget);
        })

        .on('mousemove',function(d){
            var xy = d3.mouse(document.getElementById('plot'));
            var left = xy[0], top = xy[1];
            //console.log(xy);

            var tooltip = d3.select('.custom-tooltip');   //tooltip needs to be defined here again because of scope

            tooltip
                .style('left',left+20+'px')
                .style('top',top+20+'px')
        })

        .on('mouseleave',function(d){
            var tooltip = d3.select('.custom-tooltip')
                .transition()
                .style('opacity',0);
        })
}


