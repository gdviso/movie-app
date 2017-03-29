var movieApp = {};

movieApp.flickityOn = false;

movieApp.key = "1d3ad106907eb2e5c4990c9a776237c1";

//calls for movie data:
movieApp.getData = function (movieGenre, filter, year) {

	$.ajax({
		url : 'https://api.themoviedb.org/3/discover/movie',
		type : 'GET',
		dataType : 'json',
		data : {
			api_key : movieApp.key,
			with_genres: movieGenre,
			sort_by: filter,
			include_adult:false,
			with_original_language: "en",
			year: year,
		}
	})
	.then(function(movieData){
		var result = movieData.results;
		console.log(result);
		movieApp.displayData(result);
	});
} 
//calls for movie trailer:
movieApp.getTrailer = function(id){

	$.ajax({ //trailers!
		url: 'http://api.themoviedb.org/3/movie/' + id + '/videos',
		type: "GET",
		dataType: 'json',
		data: {
			api_key : movieApp.key,
		}
	}).then(function(trailerData){
		var trailerResult = trailerData.results;
		var youtubeKey = (trailerResult[0].key +`?rel=0&amp;showinfo=0&enablejsapi=1" frameborder="0" allowfullscreen`);
		$('iframe').attr('src', `http://www.youtube.com/embed/${youtubeKey}`);
	});
}
// calls for movie cast:
movieApp.getCast = function(id){

	$.ajax({ //trailers!
		url: 'http://api.themoviedb.org/3/movie/' + id + '/casts',
		type: "GET",
		dataType: 'json',
		data: {
			api_key : movieApp.key,
		}
	}).then(function(castData){
		var castResult = castData.cast;
		movieApp.displayCasts(castResult);
	});
}
// calls for movie background:
movieApp.getBackground = function(id){

	$.ajax({
		url:'http://api.themoviedb.org/3/movie/' + id + '/images',
		type: "GET",
		dataType: 'json',
		data: {
			api_key: movieApp.key,
			include_image_language: "en"
		}
		}).then(function(backPic){
			var background = backPic.posters;
			var backPath = (background[0].file_path)
			var backLink = ("linear-gradient( rgba(0, 0, 0, 0.63), rgba(0, 0, 0, 0.63) ),url(https://image.tmdb.org/t/p/w1300_and_h730_bestv2/" + backPath + ")")
			$('.result').css('background', `${backLink}`)
	});
}
//display cast
movieApp.displayCasts = function(movieCast) {
	var shortCast = [];
	// for loop to reduce results to 5 cast members	
	for(i = 0; i < 5; i++){
		var	castMember = {name:movieCast[i].name, profilePic:movieCast[i].profile_path};
		shortCast.push(castMember);
	}
	// display results:
	shortCast.forEach(function(profile){
		var castName = profile.name;
		var castPic = profile.profilePic;
		var castNameEl = $("<p>").append(castName);
		var castPicEl = $('<img>').attr('src', `https://image.tmdb.org/t/p/w132_and_h132_bestv2/${castPic}`);
		var profileContainer = $('<div>').addClass('castContainer').append(castPicEl,castNameEl);
		var castTitle = $('<h2>').addClass('castTitle').text('Cast:')
		var displayCast = $('.castWrap').append(profileContainer);
	});
}
//display info
movieApp.displayData = function (movies) {
	if(movieApp.flickityOn === true) {
		$('.main-carousel').flickity('destroy')
		$('.main-carousel').empty();
	}
	movies.forEach(function(mov, index){
		var poster = mov.poster_path;
		var overview = mov.overview;
		// filter only movies with posters:
		if(mov.poster_path !== null){
			var seeMore = $('<button>').html(`<i class="fa fa-plus-circle" aria-hidden="true"></i> See More`).addClass('seeBtn').attr('data-index', index);
			var posterEl = $('<img>').attr('src', `https://image.tmdb.org/t/p/w300/${poster}`);
			var moviePoster = $('<div>').addClass('carousel-cell movieBox animated fadeInRight').attr("id","posters").append(posterEl,seeMore);
			$('.main-carousel').append(moviePoster);
		}	
	})
	//see more button on click
	$('.seeBtn').on('click', function(){
		//show results:
		$('.result').css('display','block');
		var getIndex = $(this).data('index');
		var arrayIndex = movies.indexOf(movies[getIndex]);
		//display full info
		if(getIndex === arrayIndex){
			$('.moreInfo').empty();
			$('.trailerWrap').empty();
		 	var movieInfo = (movies[arrayIndex]);
		 	var title = movieInfo.original_title;
			var date = movieInfo.release_date;
			var rating = movieInfo.vote_average;
			var overview = movieInfo.overview;
			var poster = movieInfo.poster_path;
		 	var backToTop = $('<a>').html("close").addClass('bottomBtn').attr('href','#');
		 	var watchTrailer = $('<a>').html("Watch Trailer").addClass('watchBtn').attr('href','#');
		 	var titleEl = $('<h2>').text(title);
			var dateEl = $('<h3>').addClass('date').html(`<span>Release Date: </span> ${date}`);
			var ratingEl = $('<h3>').addClass('rating').html(`<span>Rating: </span> ${rating}/10`);
			var overviewEl = $('<h3>').addClass('overview').html(`Overview <p>${overview}</p>`);
			var trailer = $('<iframe>');
			var posterEl = $('<img>').attr('src', `https://image.tmdb.org/t/p/w300/${poster}`);
			var posterDiv = $('<div>').addClass('poster').append(posterEl,watchTrailer)
		 	var castWrap = $('<div>').addClass('castWrap');
		 	var castTitle= $('<h3>').addClass('infoTitle').html(`<i class="fa fa-users" aria-hidden="true"></i> Casting:`);
		 	var closeTrailer = $('<button>').html(`<i class="fa fa-times-circle" aria-hidden="true"></i>`).addClass('closeBtn');
		 	var backBrowse = $('<a>').html("Back to browse").addClass('backBtn sideBtn').attr('href','#');
		 	var fullMovie =	$('<div>').addClass('about').append(titleEl,dateEl,ratingEl,overviewEl,castTitle,castWrap,backBrowse);
		 	var trailerDisplay = $('<div>').addClass('embed-container').append(trailer);
		 	// display complete movie info:
		 	$('.moreInfo').append(posterDiv,fullMovie);
		 	$('.trailerWrap').append(closeTrailer,trailerDisplay);
		 	// send id to trailer ajax calls:
		 	movieApp.getTrailer(movieInfo.id);
		 	movieApp.getCast(movieInfo.id);
		 	movieApp.getBackground(movieInfo.id);
			// See more button scrolls to results:
			$('html, body').animate({
   		 	scrollTop: $("#moreInfo").offset().top
			}, 1000);
		}
		//watch trailer button:
			$('.watchBtn').on('click',function(e){
				e.preventDefault();
				$('.trailerWrap').append(closeTrailer,trailerDisplay);
				$('section.trailer').css('visibility', 'visible');
				$('.trailerWrap').css('display', 'block');
			});
        // Close trailer
           $('.closeBtn').on('click',function(){
               $('section.trailer').css('visibility', 'hidden');
               $('.trailerWrap').empty();
            });
           $('section.trailer').on('click',function(){
               $('section.trailer').css('visibility', 'hidden');
               $('.trailerWrap').empty();
           });
        // back to top
			$('.backBtn').on('click', function(){
				// scroll back to search:
				var top = $('html, body').animate({
   			 	scrollTop: $("header").offset().top
				}, 1000);
				//pinky promise
				$.when(top).done(function(){
				$('.moreInfo').empty();
				$('.trailerWrap').empty();
				$('.trailerWrap').css('display', 'none');
				$('.result').css('display', 'none')
				});
			});
	// bottom button takes you to movie:
		$('.bottomBtn').on('click', function(){
			// scroll back to search:
			var top = $('html, body').animate({
   			scrollTop: $(".result").offset().top
			}, 1000);
		});	
	});
	// flickity setup
	movieApp.flickityOn = true;
	$('.main-carousel').flickity({
		imagesLoaded: true,
		pageDots:false,
		freeScroll: true,
		wrapAround: true,
		prevNextButtons: true,
		cellAlign: 'left'
	});
	//show trailer:
	$('.trailerWrapper').css('display', 'block');
}
//events:
movieApp.events = function(){
	$('#genres').on('change', function(){
		var movieFilter = $('#filter').val();
		var movieYear = $('#year').val();
		var movieGenre = $(this).val();
		movieApp.getData(movieGenre, movieFilter, movieYear);
		movieApp.updateTitle();
	});
	$('#filter').on('change',function(){
		var movieGenre = $('#genres').val();
		var movieYear = $('#year').val();
		var movieFilter = $(this).val();
		movieApp.getData(movieGenre, movieFilter, movieYear);
		movieApp.updateTitle();
	});
	$('#year').on('change',function(){
		var movieFilter = $('#filter').val();
		var movieGenre = $('#genres').val();
		var movieYear = $(this).val();
		movieApp.getData(movieGenre, movieFilter, movieYear);
		movieApp.updateTitle();
	});
}//events ends here
//update filter title
movieApp.updateTitle = function(){
	var genreChoice = $('select#genres option:selected').text();
	$('.title').find('span.genreSpan').text(genreChoice);
	var filterChoice = $('select#filter option:selected').text();
	$('.title').find('span.filterSpan').text(filterChoice);
	var yearChoice = $('select#year option:selected').text();
	$('.title').find('span.yearSpan').text(yearChoice);
}
//about project/credits:
movieApp.about = function(){
	$("li.content").hide();
  $("ul.toggle-menu").delegate("li.toggle", "click", function() { 
  $(this).next().toggle("slow").siblings(".content").hide("slow");
   });
}
//INIT:
movieApp.init = function (){
	movieApp.getData();
	movieApp.events();
	movieApp.about();
	// call select plugin:
 	$('select').select2();
	$(".js-example-basic-single").select2();
}
//doc ready:
$(function (){ 
	movieApp.init ();
});
