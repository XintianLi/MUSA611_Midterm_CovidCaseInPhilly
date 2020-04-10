var map = L.map('map', {
  center: [40.000, -75.1090],
  zoom: 11
});

var originalMapBounds=[[39.9602803542957,-75.45822143554689],[40.03918079694873,-74.75921630859376]]

var Stamen_TonerLite = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
  attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  subdomains: 'abcd',
  minZoom: 0,
  maxZoom: 20,
  ext: 'png'
}).addTo(map);

// set different slidebars
var slides = [
  { title: "Coronavirus(COVID-19) Cases in Philadelphia", description: "This website shows the Coronavirus cases in the Philadelphia City until April 1st. The choropleth shows the number of cases in each zip code. Please click on the Next button to learn more about the condtions of the global pandemic in Philly.", color: "#fcc5c0" },
  { title: "Positives in each Zip CODE", description: "On this page, you will see the details of cases in each zip code, please click on the map to see the details for each zip code", color: '#fa9fb5' },
  { title: "Areas with most positive cases", description: "Look at those areas with cases more than 50. It seems that south and west of Philadelphia have more cases.     Click on each one to see details in sidebar!", color: "#f768a1", zoom: 12, viewCenter:[39.98580147048377, -75.14854431152344], showResults:1},
  { title: "Local conditions in 19104", description: "The zip code 19104 is the area where I live in, currently it has 264 tested, 62 positives and the positive rate is 23.5%.", color: "#ae017e", bounds:[[39.9421636551556,-75.2140215999799],[39.9778001758298,-75.1793017004114]]},
  { title: "Conclusions", description: "The cases in Philly is still increasing, please stay at home and take care of yourself and your loved ones!", color: "#7a0177", textColor: "white"}
]
slides[3].filter = function(feature){
    return feature.properties.ZIPCODE==19104
}

slides[2].filter = function(feature){
    return feature.properties.Positives> 50
}

var currentSlide = 0

// import data
var dataset="https://raw.githubusercontent.com/XintianLi/MUSA611_Midterm_CovidCaseInPhilly/master/COVIDCase1.geojson"
var featureGroup;
var parsedData;

function getColor(positives){
  return positives > 60 ? "#E31A1C" :
         positives > 45 ? "#FC4E2A" :
         positives > 30 ? "#FD8D3C" :
         positives > 15 ? "#FEB24C" :
         positives > 5 ? "#FED976" :
                 "#FFEDA0";
}

myStyle = function(feature){
  return{
    fillColor: getColor(feature.properties.Positives),
    fillOpacity:0.7,
    color:"white",
    weight:2,
    opacity:1
  };
}

$(document).ready(function() {
  $.ajax(dataset).done(function(data) {
    parsedData = JSON.parse(data);
    featureGroup = L.geoJson(parsedData, {
      style: myStyle
    }).addTo(map);
  });
});

// build the function of popup
var eachPopUp = function(layer){
  console.log(layer)
  layer.bindPopup(`<b>Zip Code: ${layer.feature.properties.ZIPCODE}</b><br>Positive Number: ${layer.feature.properties.Positives}<br>Total Tested Number:${layer.feature.properties.All_Tests}<br>Percentage of Positivity:${layer.feature.properties.Positivity}` ); //how to round this number?
}

// click and change the content of the layer
var eachFeatureChangeText = function(layer){
  layer.on('click',function(event){
      $('.positives').text(layer.feature.properties.Positives);
      $('.zip-code').text(layer.feature.properties.ZIPCODE);
  });
}

var showResults=function(layer){
  layer.on("click",function(event){
    $("#originalIntro").hide();
    $("#PageTwoDetails").show()
  })

}

// create a function which is connected with the button click to change the content and style of the sidebar.
var loadSlide = function(slide) {
    if ('zoom' in slide){
      map.setView(slide.viewCenter,slide.zoom)
    }
    if ("bounds" in slide){
      map.fitBounds(slide.bounds);
    } else{map.fitBounds(originalMapBounds)}

    // featureGroup.clearLayers()
    if (featureGroup) {map.removeLayer(featureGroup)}
    featureGroup = L.geoJson(parsedData, {
      style: myStyle,
      filter:slide.filter
    }).addTo(map);
    featureGroup.eachLayer(eachPopUp);
    $('#title').text(slide.title)
    $('#description').text(slide.description)
    $('.sidebar').css("background-color", slide.color)
    if ("showResults" in slide){
      featureGroup.eachLayer(showResults)
      featureGroup.eachLayer(eachFeatureChangeText)
    } else{
      $("#originalIntro").show();
      $("#PageTwoDetails").hide()
    }
    if ('textColor' in slide){
      $(".text").css("color",slide.textColor)
    } else {
      $(".text").css("color","black")
    }
}

// a function that is connected with the click to change content and control the appearing of the buttons
var next = function() {
  if (currentSlide == slides.length - 1) {
  } else {
    $('#nextButton').show()
    currentSlide = currentSlide + 1
    loadSlide(slides[currentSlide])
  }
  if (currentSlide == slides.length - 1) {
    $('#nextButton').hide()
  }
  if (currentSlide == 0){
    $('#previousButton').hide()
  } else {
    $('#previousButton').show()
  }
}

// a function that is connected with the click to change content and control the appearing of the buttons
var previous=function(){
  if (currentSlide == 1){
    currentSlide = currentSlide-1
    loadSlide(slides[currentSlide])
    $('#nextButton').show()
    $('#previousButton').hide()
  } else {
    currentSlide = currentSlide-1
    loadSlide(slides[currentSlide])
    $('#nextButton').show()
  }
}


// Not used
var eachFeatureFunction = function(layer) {
  layer.on('click',function(event){
    console.log(layer.getBounds())
    console.log(layer.feature.properties.ZIPCODE)
  })
};


// the applications of the functions
$('#nextButton').click(function(e) {
  next()
});

$('#previousButton').click(function(e) {
  previous()
})
