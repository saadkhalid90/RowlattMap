let mapLocs;
let roadPoints;
let uniqueLocs;

let timeTrans = 2000;
let timeDelay = 0;

let multiplier = 0.2;

let dateFocus;

async function readAndDraw(){
  mapLocs = await d3.tsv('RowlattActLocations.tsv');
  roadPoints = await d3.csv('RoadPoints1919.csv');
  console.log(mapLocs);
  console.log(roadPoints);

  let testRoad = roadPoints.filter(d => d.Road == "Anarkali-Mall")

  //let testRoad = roadPoints;

  let uniqueLocs = mapLocs.filter((v, i, s) => {
      let locIDs = s.map(d => d['Location ID']);
      return locIDs.indexOf(v['Location ID']) === i;
  });

  uniqueLocs = uniqueLocs.filter(function(d){
    return d.X != "";
  })

  mapLocDate = mapLocs;

  console.log(uniqueLocs);

  d3.select('svg.mapLocs')
    .selectAll('circle.pulsating')
    .data(uniqueLocs)
    .enter()
    .append('circle')
    .attr('class', 'pulsating')
    .attr('cx', d => {
        return d.X * multiplier;
    })
    .attr('cy', d => {
      return d.Y * multiplier;
    })
    //.attr('r', '0px')
    .style('fill', 'teal')
    .style('stroke', '#212121')
    .style('stroke-width', '2px')
    .call(pulseTrans, timeTrans, timeDelay);

  let roadPath = d3.select('svg.mapLocs')
    .selectAll('path.road')
    .data(testRoad)
    .enter()
    .append("path")
    .attr('class', 'road')
    .attr('d', d => makePathString(d.Points, multiplier))
    .style('fill', 'none')
    .style('stroke', 'purple')
    .style('stroke-linecap', 'round')
    .style('stroke-linejoin', 'round')
    .style('stroke-width', '4px')
    //.attr("stroke-dasharray", 502)
    //.attr("stroke-dashoffset", 0);

  let totalLength = roadPath.node().getTotalLength();

  // console.log(totalLength)
  //
  roadPath.style('stroke-opacity', 0.75)
    .attr("stroke-dasharray", totalLength)
    .attr("stroke-dashoffset", totalLength)
    .transition()
          .duration(3000)
          .ease(d3.easeLinear)
          .attr("stroke-dashoffset", 0);

  d3.select('svg.mapLocs')
    .selectAll('circle.static')
    .data(uniqueLocs)
    .enter()
    .append('circle')
    .attr('class', 'static')
    .attr('cx', d => {
        return d.X * multiplier;
    })
    .attr('cy', d => {
      return d.Y * multiplier;
    })
    .attr('r', '8px')
    .style('fill', 'teal')
    .style('stroke', '#212121')
    .style('stroke-width', '2px')


  dateFocus = function(Date) {

      d3.select('svg.mapLocs')
        .selectAll('circle.pulsating')
        .remove();

      let mapFilt = Date == "all" ? mapLocDate : mapLocDate.filter(d => d.Date == Date);

      d3.select('svg.mapLocs')
        .selectAll('circle.pulsating')
        .data(mapFilt)
        .enter()
        .append('circle')
        .attr('class', 'pulsating')
        .attr('cx', d => multiplier * d.X)
        .attr('cy', d => multiplier * d.Y)
        //.attr('r', '0px')
        .style('fill', 'teal')
        .style('stroke', '#212121')
        .style('stroke-width', '2px')
        .call(pulseTrans, timeTrans, timeDelay, Date);

      let StatBub = d3.select('svg.mapLocs')
        .selectAll('circle.static')
        .raise();

      StatBub
        .filter(d => {
          let dateArr = d.DateList.split(' ');
          return dateArr.includes(Date);
        })
        .transition()
        .duration(500)
        .style('fill', 'yellow')

      StatBub
      .filter(d => {
        let dateArr = d.DateList.split(' ');
        return !dateArr.includes(Date);
        })
        .transition()
        .duration(500)
        .style('fill', 'teal')
    }





  function pulseTrans(selection, transDur, transDelay) {
    selection
      .attr('r', '0px')
      .style('stroke-opacity', 1)
      .style('fill-opacity', 1)
      .transition()
      .delay((d, i) => i * transDelay)
      .duration(transDur)
      .attr('r', '30px')
      .style('stroke-width', '5px')
      .style('stroke-opacity', 0)
      .style('fill-opacity', 0)
      // .each(function(d, i){
      //   let elem = this;
      //   d3.select(this)
      //     .transition()
      //     .on('end', function(){
      //       d3.select(elem)
      //         //.selectAll('circle.pulsating')
      //         .call(pulseTrans, 2500, 0);
      //     });
      // })
      .on('end', function(d, i){
        //console.log(this)
        d3.select(this)
          //.selectAll('circle.pulsating')
          .call(pulseTrans, timeTrans, 0);
      });
      // .end()
      // .then()

  }

  d3.selectAll('circle.static')
    .on('mouseover', function(d, i){
      console.log(this);
      d3.select(this).append('title')
        .text(d['Location Name'])
    })
}

readAndDraw();

function zoomInOut(selection, scale, translateArr, transDur){
    selection.transition()
            .duration(transDur)
            .style('transform', `translate(${translateArr[0]}px, ${translateArr[1]}px) scale(${scale})`)
}

// d3.select('img.mapBG').call(zoomIn, 1.1, 1000);
// d3.select('svg.mapLocs').call(zoomIn, 1.1, 1000);

function pictSVGZoom(scale, translateArr, transDur){
  // select both the image and the svg and apply transform to it
  return d3.selectAll('.zoomable')//.call(zoomInOut, scale, translateArr, transDur).end();
          .transition()
          .duration(transDur)
          .style('transform', `translate(${translateArr[0]}px, ${translateArr[1]}px) scale(${scale})`)
          .end();
}

function pictSVGZoomDate(scale, transDur, date, mapData, multiplier){
  // select both the image and the svg and apply transform to it

  //console.log(d3.select('img').node())


  let mapDataDate = mapData.filter(d => d.Date == date);

  console.log(mapDataDate.map(d => +d.X).filter(d => d != 0));
  console.log(mapDataDate.map(d => +d.Y).filter(d => d != 0));

  let xAvg = average(mapDataDate.map(d => +d.X).filter(d => d != 0));
  let yAvg = average(mapDataDate.map(d => +d.Y).filter(d => d != 0));

  let xAvgScaled = xAvg * multiplier;
  let yAvgScaled = yAvg * multiplier;

  let xNorm = document.getElementsByClassName('mapContain')[0].getBoundingClientRect().width;  // automate this
  let yNorm = document.getElementsByClassName('mapContain')[0].getBoundingClientRect().height;  // automate this

  let xImg = 923; // automate this
  let yImg = 1134;  // automate this

  let xImgNormDiff = ((xImg - xNorm)/2) * scale;
  let yImgNormDiff = ((yImg - yNorm)/2) * scale;

  function scaleTransFactor(scale){
    return 1 + ((scale - 1)/2);
  }

  let avgT = transformXY([xImg, yImg], scale, [xAvgScaled, yAvgScaled]);

  let xExt = ((xNorm/2) - avgT[0]) //* scaleTransFactor(scale);
  let yExt = ((yNorm/2) - avgT[1]) //* scaleTransFactor(scale);

  let xScaled = xImg * scale;
  let yScaled = yImg * scale;

  let xLim = (xScaled - xImg)/2;
  let yLim = (yScaled - yImg)/2;

  xLim = (xExt >= 0) ? xLim : -xLim - (1.5 * xImgNormDiff);
  yLim = (yExt >= 0) ? yLim : -yLim - (1.5 * yImgNormDiff);



  let xTrans = Math.abs(xExt) > Math.abs(xLim) ? (xLim-55) : (xExt);
  let yTrans = Math.abs(yExt) > Math.abs(yLim) ? (yLim-55) : (yExt);

  let transArr = [xTrans, yTrans];
  //let transArr = [xLim, yLim];
  //let transArr = [xExt, yExt];

  //console.log("XY Lim", xLim, yLim);
  console.log("XYAvg", xAvgScaled, yAvgScaled);
  console.log('xImg', xImg/ 2, yImg/ 2)
  console.log("XYAvgT", avgT[0], avgT[1]);
  console.log("XYExt", xExt, yExt);
  //console.log("Trans", transArr);

  // d3.select('img.mapBG').call(zoomInOut, scale, transArr, transDur);
  // d3.select('svg.mapLocs').call(zoomInOut, scale, transArr, transDur);

  //await pictSVGZoom(1, [0, 0], transDur);
  return pictSVGZoom(scale, transArr, transDur);

}

function average(values) {
  let sum = values.reduce((previous, current) => current += previous);
  let avg = sum / values.length;

  return avg;
}

function transformXY(imgDims, scale, coords){
  let scaledDims = imgDims.map(dim => dim * scale);
  let imgCenter= imgDims.map(dim => dim/ 2);
  let scaledCoords = coords.map(coord => coord * scale);
  console.log(scaledDims);
  let excess = scaledDims.map((d,i) => d - imgDims[i]);
  console.log('excess', excess);
  console.log('scaledC', scaledCoords)
  return scaledCoords.map((d, i) =>  d - excess[i]/2 );
}

function makePathString(pointsString, multiplier){
  let pointsArr = pointsString.split(" ");
  pointsArr = pointsArr.map(d => +d * multiplier);
  pointsArr = pointsArr.map((d, i) => (i%2)==0 ? d : `,${d}L`);
  let pathStr = pointsArr.join("");
  pathStr = pathStr.substring(0, pathStr.length - 1);

  return `M${pathStr}`;
}

d3.selectAll('p.dateP')
  .on('click', function(d, i){
    let date= d3.select(this).html();
    let dataDate;
    let zoomVal;
    let dateMonth;
    let dateDay;

    d3.selectAll('p.dateP')
      .classed('clicked', false)
      //.style('color', 'white')
      .style('transform', 'scale(1.0)');

    // d3.selectAll('p.dateP:hover')
    //   .style('color', '#FFEB3B')

    d3.select(this)
      .classed('clicked', true)
      //.style('color', '#FFEB3B')
      .transition()
      //.duration(500)
      .style('transform', 'scale(1.2)');

    function dateHTMLToData(Date){
      switch (date) {
        case "March 9":
          dataDate = '9/3/19';
          zoomVal = 1.7;
          break;
        case "April 6":
          dataDate = '6/4/19';
          zoomVal = 1.45;
          break;
        case "April 10":
          dataDate = '10/4/19';
          zoomVal = 1.30;
          break;
        case "April 11":
          dataDate = '11/4/19';
          zoomVal = 1.65;
          break;
        case "April 12":
          dataDate = '12/4/19';
          zoomVal = 1.35;
          break;
        case "April 14":
          dataDate = '14/4/19';
          zoomVal = 1.65;
          break;
        case "April 17":
          dataDate = '17/4/19';
          zoomVal = 1.75;
          break;
        case "April 18":
          dataDate = '18/4/19';
          zoomVal = 1.7;
          break;
        case "May 20":
          dataDate = '20/5/19';
          zoomVal = 1.8;
          break;
        default:
      }
      dateMonth = date.split(" ")[0];
      dateDay = date.split(" ")[1];
      return dataDate;
    }

    console.log(dateHTMLToData(date));

    let dateText = dateHTMLToData(date);
    dateFocus(dateText);
    pictSVGZoomDate(zoomVal, 1500, dateText, mapLocs, 0.2)

    d3.select('p.date.month').html(dateMonth);
    d3.select('p.date.day').html(dateDay);
  })

  d3.selectAll('p.dateP').on('mouseover', function(d, i){
    d3.select(this).classed('hovered', true);
  })
  d3.selectAll('p.dateP').on('mouseout', function(d, i){
    d3.select(this).classed('hovered', false);
  })
