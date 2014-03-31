
//============================== MODEL ==============================

function Model(){
	this.actual = -1			// Cancion= -1, no ha cargado datos
	this.songs = []				// Lista de canciones
	this._isPlaying = false		// Inicia Pausado
}
Model.prototype = new Observable()		// Observable globalmente
Model.prototype.goTo = function( index ){
	// Se ubica en el inicio del elemento y lo inicializa
	this.setActive( index )
}
Model.prototype.setSongs = function( songs ){
	// Carga la lista de canciones
	this.songs = songs
	// Informa que la lista cambio
	this.trigger('songs-changed', this.songs)
}
Model.prototype.getActual = function(){
	// Devuelve la cancion que esta en esa ubicacion
	return this.songs[ this.actual ]
}
Model.prototype.getActualIndex = function(){
	// Retorna la cancion actual del Index
	return this.actual
}
Model.prototype.setActive = function( index ){
	// Inicializa el contador
	if( index < 0 || index >= this.songs.length ) index = 0
	this._isPlaying = true		// Inicia la reproduccion
	this.actual = index			// Setea la cancion del contador
	// Informa inicio de reproduccion de esa cancion
	this.trigger('active-song', this.songs[ index ])
}
Model.prototype.setPlaying = function( bool ){
	this._isPlaying = bool
	if( bool ) this.trigger('playing')	// TRUE = Play
	else this.trigger('paused')			// FALSE = Pause
}
Model.prototype.isPlaying = function(){
	// Informa si esta o no reproduciendo
	return this._isPlaying
}

//============================== VIEW ===============================

function View(){
	var self = this		// Lo asigna a el mismo

	this.elems = {}		// Variable vacia
	// Genera el elemento 'audio'
	this.elems.audio = document.createElement('audio')
	// Lo asigna como hijo
	document.body.appendChild( this.elems.audio )

	// Controles del reproductor
	this.elems.play = $('#play')
	this.elems.next = $('#next')
	this.elems.prev = $('#prev')

	// Elementos lista de reproduccion
	this.elems.list = $('#song-list')
	this.elems.avatar = $('.cover img')
	this.elems.name = $('.playing .name')
	this.elems.artist = $('.playing .author')

	// Delegación del click
	this.elems.list.on('click', '.song', function(){
		self.trigger('song-clicked', $(this).attr('data-id'))
	})
	this.elems.play.on('click', function(){
		self.trigger('play-clicked')	// Boton Play
		return false
	})
	this.elems.next.on('click', function(){
		self.trigger('next-clicked')	// Boton Siguiente
		return false
	})
	this.elems.prev.on('click', function(){
		self.trigger('prev-clicked')	// Boton Anterior
		return false
	})

	// Creación template lista de canciones
	this.template = Handlebars.compile( $('#song-tmpl').html() )
}
View.prototype = new Observable()		// Observable globalmente
View.prototype.updateList = function( songList ){
	// Actualiza las canciones en el template
	this.elems.list.html( this.template( { songs: songList } ) ) 
}
View.prototype.updateActive = function( song ){
	this.elems.avatar.attr('src', song.img)	// Cover
	this.elems.name.text( song.name )		// Cancion
	this.elems.artist.text( song.artist )	// Artista

	this.elems.audio.pause()
	this.elems.audio.src = song.src
	this.elems.audio.play()
}
View.prototype.playSong = function(){
	this.elems.audio.play()
}
View.prototype.pauseSong = function(){
	this.elems.audio.pause()
}

//=========================== CONTROLLER ============================

var controller = {
	init: function(){
		var self = this

		// Instancio mi modelo y vista
		this.model = new Model()
		this.view = new View()

		// Escuchar eventos del modelo
		this.model.on('songs-changed', function( e, songs ){
			self.view.updateList( songs )
		})
		this.model.on('active-song', function( e, song ){
			self.view.updateActive( song )
		})
		this.model.on('playing', function( e, song ){
			self.view.playSong( song )
		})
		this.model.on('paused', function( e, song ){
			self.view.pauseSong( song )
		})

		// Escuchar eventos de la vista
		this.view.on('song-clicked', function( e, index ){
			self.model.setActive( index )
		})
		this.view.on('play-clicked', function(){
			self.model.setPlaying( !self.model.isPlaying() )
		}) 
		this.view.on('next-clicked', function(){
			self.model.goTo( self.model.getActualIndex() + 1 )
		}) 
		this.view.on('prev-clicked', function(){
			self.model.goTo( self.model.getActualIndex() - 1 )
		}) 

		// Inicializacion
		this.model.setSongs([
			{
				name: 'Ill Be My Mirror',
				artist: '8in8',
				src: 'media/8in8_-_05_-_Ill_Be_My_Mirror.mp3',
				img: 'img/songs/test.jpg'
			},
			{
				name: 'Floss Suffers',
				artist: 'Blue Ducks',
				src: 'media/Blue_Ducks_-_01_-_Floss_Suffers_From_Gamma_Radiation.mp3',
				img: 'img/songs/test.jpg'
			},
			{
				name: 'IMF',
				artist: 'DOt',
				src: 'media/DOt_-_05_-_IMF.mp3',
				img: 'img/songs/test.jpg'
			}
		])
		this.model.setActive( 0 )
	}
}

//=============================== RUN ===============================

controller.init()
