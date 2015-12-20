/**
 * Created by yangmuhe on 12/01/15.
 */
console.log("Final Project");

var margin = {t:20,r:200,b:80,l:80};
var width = document.getElementById('plot').clientWidth - margin.r - margin.l,
    height = document.getElementById('plot').clientHeight - margin.t - margin.b;

var canvas = d3.select('#plot');
var plot = canvas
    .append('svg')
    .attr('width',width+margin.r+margin.l)
    .attr('height',height + margin.t + margin.b)
    .append('g')
    .attr('class','canvas')
    .attr('transform','translate('+margin.l+','+margin.t+')');

//Scales
var scaleX = d3.scale.linear().domain([1940,2005]).range([0,width]),
    scaleYrating = d3.scale.linear().domain([0,10]).range([height,0]),
    scaleYlength = d3.scale.linear().domain([0,350]).range([height,0]),
    scaleYbudget = d3.scale.linear().domain([0,200000000]).range([height,0]),
    scaleR = d3.scale.sqrt().domain([0,10]).range([0,10]),
    scaleColor = d3.scale.ordinal()
        .domain(['action','animation','comedy','drama','documentary','romance','short'])
        .range(['rgb(65,179,255)','#9467bd','#74c476','rgb(252,144,33)','red','rgb(255,65,150)','rgb(180,180,180)']);

//Axis
var axisX = d3.svg.axis()
    .orient('bottom')
    .scale(scaleX)
    .tickFormat( d3.format('d') ); //https://github.com/mbostock/d3/wiki/Formatting
var axisY = d3.svg.axis()
    .orient('left')
    .tickSize(width)
    .scale(scaleYrating);

//Draw axes
plot.append('g').attr('class','axis axis-x')
    .attr('transform','translate(0,'+height+')')
    //.call(axisX);

plot.append('g').attr('class','axis axis-y')
    .attr('transform','translate('+width+',0)')
    //.call(axisY);

var scatterPlot = plot.append('g').attr('class', 'scatterplot');

var lineGeneratorLength = d3.svg.line()
    .x(function(d){ return scaleX(d.year)})
    .y(function(d){ return scaleYlength(d.averageLength)})
    .interpolate('basis');   //!!!

var lineGeneratorBudget = d3.svg.line()
    .x(function(d){return scaleX(d.year)})
    .y(function(d){return scaleYbudget(d.averageBudget)})
    .interpolate('basis');

var lineGeneratorRating = d3.svg.line()
    .x(function(d){return scaleX(d.year)})
    .y(function(d){return scaleYrating(d.averageRating)})
    .interpolate('basis');


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

    /*if(parsedRow.year > 1939){
        return parsedRow;
    }else{return;}*/

    if(parsedRow.votes > 1000){
        return parsedRow;
    }else{return;}

    if(parsedRow.action==1 || parsedRow.animation==1 || parsedRow.comedy==1 || parsedRow.drama==1 || parsedRow.romance==1 || parsedRow.short==1){
        return parsedRow;
    }else{return;}
}

function genre(d){
    if(d.action == 1){return 'action';}
    else if(d.animation == 1){return 'animation'}
    else if(d.comedy == 1){return 'comedy'}
    else if(d.drama == 1){return 'drama'}
    else if(d.documentary == 1){return 'documentary'}
    else if(d.romance == 1){return 'romance'}
    else{return 'short'}
}


function dataLoaded(error, data){

    //Sort data before nest, otherwise the sort method doesn't work.
    data.sort(function(a,b){
        return b.rating - a.rating;  //in descending order
    });
    //console.log(data);

    var nestedData = d3.nest()
        .key(function(d){return d.year })
        .entries(data);

    var nestedData1940 = nestedData.slice(21,87);
    //console.log(nestedData1940);


    //Draw time-rating
    d3.selectAll('.btn-group .year').on('click',function(){

        //Update Y axis
        scaleYrating = d3.scale.linear().domain([0,10]).range([height,0]);
        axisY.scale(scaleYrating);
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
        }else if(times=='2000s'){
            draw(data,2000,2005);
        }else{
            scatterPlot.append('path')
                .attr('class','data-line');
            nestedData1940.forEach(function(t){
                t.year = t.key;   //!!!
                t.averageRating = d3.mean(t.values, function(data){return data.rating});
            });
            drawRating(data, nestedData1940)}
    });


    //Draw time-length or time-budget
    d3.selectAll('.btn-group .producer').on('click',function(){

        //Update X axis
        scaleX = d3.scale.linear().domain([1940,2005]).range([0,width]);
        axisX.scale(scaleX);
        plot.selectAll('g.axis.axis-x')
            .transition()
            .duration(1500)
            .call(axisX);

        //Append line elements every time clicking buttons
        scatterPlot.append('path')
            .attr('class','data-line');

        var type = d3.select(this).attr('id');
        console.log("Show the changes of " + type + " during 1940 to 2005.");

        if(type=='length'){
            // Setup each row of data by formatting the year for X and averageLength for Y
            nestedData1940.forEach(function(t){
                t.year = t.key;   //!!!
                t.averageLength = d3.mean(t.values, function(data){return data.length});
            });
            drawLength(data, nestedData1940);
        }else{
            nestedData1940.forEach(function(t){
                t.year = t.key;   //!!!
                t.averageBudget = d3.mean(t.values, function(data){return data.budget});
            });
            drawBudget(data, nestedData1940);
        }
    })
}


//Draw time-rating scatterplot for different periods
function draw(dataArray,startYear,endYear){

    //Update X axis
    scaleX = d3.scale.linear().domain([startYear,endYear]).range([0,width]);
    axisX.scale(scaleX);
    plot.selectAll('g.axis.axis-x')  //!!!
        .transition()   //animation
        .duration(1500)
        .call(axisX);

    //Remove line before drawing circles
    scatterPlot.selectAll('.data-line').remove();

    var filteredData = dataArray.filter(function(d){ return d.year <= endYear});

    var dots = scatterPlot.selectAll('.data-point')
        .data(filteredData, function(d){return d.uid});   //with key function!

    var dotsEnter = dots.enter()
        .append('g')
        //.filter(function(d){ return d.year <= endYear})
        .attr('class','data-point')
        .attr('transform',function(d){return 'translate('+scaleX(d.year)+','+scaleYrating(d.rating)+')';})
        .on('click',function(d){
            scatterPlot.selectAll('circle')
                //.style('stroke','none'); //with this line, the outline only happens on the latest-clicked circle
            d3.select(this).select('circle')
                .style('stroke','rgb(80,80,80)')
                .style('stroke-width','2px')
        });
    dotsEnter.append('circle')
        .style("display", function(d) { return d.year > endYear ? "none" : null; })
        .attr('r',0)
        .style('fill',function(d){return scaleColor(genre(d));})
        .style('fill-opacity',0.5)
        .call(tooltip);

    dots.exit()
        .transition().duration(500)
        .style('opacity',0)
        .remove();

    dots.transition()
        .duration(1500)
        .attr('transform',function(d){return 'translate('+scaleX(d.year)+','+scaleYrating(d.rating)+')';})
        .select('circle')
        .attr('r',function(d){return scaleR(d.rating)});
}


//Draw time-rating for all times
function drawRating(dataArray, nestedData){

    //Update X axis
    scaleX = d3.scale.linear().domain([1940,2005]).range([0,width]);
    axisX.scale(scaleX);
    plot.selectAll('g.axis.axis-x')
        .transition()
        .duration(1500)
        .call(axisX);

    var line = scatterPlot.select('.data-line')
        .datum(nestedData)
        .transition()
        .delay(1500)
        //.ease('linear')
        .duration(1000)
        .attr('d',lineGeneratorRating);

    var filteredData = dataArray.filter(function(d){ return d.year >= 1940});

    var dots = scatterPlot.selectAll('.data-point')
        .data(filteredData, function(d){return d.uid});

    var dotsEnter = dots.enter()
        .append('g')
        //.filter(function(d){ return d.year >= 1940})
        .attr('class','data-point')
        .attr('transform',function(d){return 'translate('+scaleX(d.year)+','+scaleYrating(d.rating)+')';})
        .on('click',function(d){
            scatterPlot.selectAll('circle')
            //.style('stroke','none'); //with this line, the outline only happens on the latest-clicked circle
            d3.select(this).select('circle')
                .style('stroke','rgb(80,80,80)')
                .style('stroke-width','2px')
        });
    dotsEnter.append('circle')
        .attr('r',0)
        .style('fill',function(d){return scaleColor(genre(d));})
        .style('fill-opacity',0.5)
        .call(tooltip);

    dots.exit()
        .transition()//.duration(300)
        .remove();

    dots.transition()
        .duration(1500)
        .attr('transform',function(d){return 'translate('+scaleX(d.year)+','+scaleYrating(d.rating)+')';})
        .select('circle')
        .attr('r',3)
}


//Draw time-length
function drawLength(dataArray, nestedData){

    //Update Y axis
    axisY.scale(scaleYlength);
    plot.selectAll('g.axis.axis-y')
        .transition()
        .duration(1500)
        .call(axisY);

    var line = scatterPlot.select('.data-line')
        .datum(nestedData)
        .transition()
        .delay(1500)
        //.ease('linear')
        .duration(1000)
        .attr('d',lineGeneratorLength);

    var filteredData = dataArray.filter(function(d){ return d.year >= 1940});

    var dots = scatterPlot.selectAll('.data-point')
        .data(filteredData, function(d){return d.uid});

    var dotsEnter = dots.enter()
        .append('g')
        //.filter(function(d){ return d.year >= 1940})
        .attr('class','data-point')
        .attr('transform',function(d){return 'translate('+scaleX(d.year)+','+scaleYlength(d.length)+')';})
        .on('click',function(d){
            scatterPlot.selectAll('circle')
            d3.select(this).select('circle')
                .style('stroke','rgb(80,80,80)')
                .style('stroke-width','2px')
        });
    dotsEnter.append('circle')
        .attr('r',0)
        .style('fill',function(d){return scaleColor(genre(d));})
        .style('fill-opacity',0.5)
        .call(tooltip);

    dots.exit()
        .transition()//.duration(300)
        .remove();

    dots.transition()
        .duration(1500)
        .attr('transform',function(d){return 'translate('+scaleX(d.year)+','+scaleYlength(d.length)+')';})
        .select('circle')
        .attr('r',3)

}


//Draw time-budget
function drawBudget(dataArray, nestedData){

    //Update Y axis
    axisY.scale(scaleYbudget);
    plot.selectAll('g.axis.axis-y')
        .transition()
        .duration(1500)
        .call(axisY);

    //Draw line
    var line = scatterPlot.select('.data-line')
        .datum(nestedData)
        .transition()
        .delay(1500)
        .duration(1000)
        .attr('d',lineGeneratorBudget);

    var filteredData = dataArray.filter(function(d){ return d.year >= 1940});

    //Draw circles
    var dots = scatterPlot.selectAll('.data-point')
        .data(filteredData, function(d){return d.uid});

    var dotsEnter = dots.enter()
        .append('g')
        //.filter(function(d){ return d.year >= 1940})
        .attr('class','data-point')
        .attr('transform',function(d){return 'translate('+scaleX(d.year)+','+scaleYbudget(d.budget)+')';})
        .on('click',function(d){
            scatterPlot.selectAll('circle')
            d3.select(this).select('circle')
                .style('stroke','rgb(80,80,80)')
                .style('stroke-width','2px')
        });
    dotsEnter.append('circle')
        //.style("display", function(d) { return d.budget == 0 ? "none" : null; })
        .attr('r',0)
        .style('fill',function(d){return scaleColor(genre(d));})
        .style('fill-opacity',0.5)
        .call(tooltip);

    dots.exit()
        .transition()
        .remove();

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
            console.log(genre(d));

            var tooltip = d3.select('.custom-tooltip');
            tooltip
                .transition()
                .style('opacity',1);

            tooltip.html('<h2>'+d.title+'</h2>'+
                '<p>Rating: '+d.rating+'</p>'+
                '<p>Year: '+d.year+'</p>'+
                '<p>Genre: '+genre(d)+'</p>'+
                '<p>Length: '+d.length+' min</p>'+
                '<p>Budget: $'+d.budget+'</p>');
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


//Create scroll controller
//Create a global scroll controller
var scrollController = new ScrollMagic.Controller({
    globalSceneOptions:{
        triggerHook:'onLeave'
    }
});

//Create scenes
var scene1 = new ScrollMagic.Scene({
    duration:document.getElementById('scene-1').clientHeight,
    triggerElement:'#scene-1',
    reverse:true
})
    .on('enter',function(){
        console.log('Enter Scene 1');
    })
    .addTo(scrollController);

var scene2 = new ScrollMagic.Scene({
    duration:document.getElementById('scene-2').clientHeight,
    triggerElement:'#scene-2',
    reverse:true
})
    .on('enter',function(){
        console.log('Enter Scene 2');
        d3.select('#scene-2').transition().style('background','none');
    })
    .addTo(scrollController);

var scene3 = new ScrollMagic.Scene({
    duration:document.getElementById('scene-3').clientHeight,
    triggerElement:'#scene-3',
    reverse:true
})
    .on('enter',function(){
        console.log('Enter Scene 3');
        d3.select('#plot').transition().style('background','none');
    })
    .addTo(scrollController);

var scene4 = new ScrollMagic.Scene({
    duration:document.getElementById('scene-4').clientHeight,
    triggerElement:'#scene-4',
    reverse:true
})
    .on('enter',function(){
        console.log('Enter Scene 4');
        d3.select('#scene-4')
            .transition()
            //.style('background','rgba(247,202,201,0.2)')
            .style('background','rgba(146,168,209,0.15)')
    })
    .addTo(scrollController);
