import React from 'react';

//import player library and QoS SDK
import videojs from 'video.js';
import {SDK} from '../sdk/QoSSDK';
import {Utils} from '../sdk/videojs/utils';

//import material UI components
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import Button from '@material-ui/core/Button';
import Input from '@material-ui/core/Input';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import InputAdornment from '@material-ui/core/InputAdornment';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

//import custom user interface definitions
import SampleVideos from './SampleVideos';
import {SubscribeVideo} from './SubscribeVideo';
import {PopularVideos} from './PopularVideos';
import {SubscribeActiveUser} from './SubscribeActiveUser';

//import styling
import './css/VideoPlayer.css';

export default class VideoJSPlayer extends React.Component {

  constructor(props) {
    super(props);
    // console.log(props);
    this.state = { // estado global
      videoUrl: 'https://d11m3z1cau3tha.cloudfront.net/3344392a-7aa7-4fa8-95b3-aee2406014dc/hls/2_la_importancia_de_whatsapp.m3u8',
      trails: [],
      videoid: '',
   
    };
    // console.log("In VideoJSPlayer.constructor.this :",this);

    this.getVideoId = this.getVideoId.bind(this);
    this.onPlay = this.onPlay.bind(this);
    this.onPause = this.onPause.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.addTrail = this.addTrail.bind(this); //SENDEROS
  }

  componentWillMount() { //el componente se desmontera (futuro)
    window.__MUI_USE_NEXT_TYPOGRAPHY_VARIANTS__ = true;
  
  }

  //Llamame cuando el componente este montado
  componentDidMount() {

    //initialize the QoS SDK
    var sdk = new SDK(this);
    this.sdk = sdk;
    var utils = new Utils();

    //initialize user
    sdk.getUser();

    // iniciar video js
    this.player = videojs(this.videoNode, {...this.props,liveui: false,
      controlBar: {
        liveDisplay: false,
        pictureInPictureToggle: false
      }}, function onPlayerReady() {
    
      

    
    });

    //-----Capturing Events for SDK-----
  
  
//SDK CUANDO SE PONE PLAY
    //fired when video is played
    this.player.on('play', function() { // cuando se le de play
      sdk.play(utils.getPlaylistType(this));
    });

    //Fired when the user agent begins looking for the media
    this.player.on('loadstart', sdk.loadStarted);

    //fired when the metadata,first frame info of the media is available
    this.player.on('loadeddata', function() {
      // console.log("In loadeddata :", this);
      let segmentInfo = utils.getSegmentInfo(this);
      sdk.loadeddata(this.duration(), utils.getPackageType(this), this.tech_.hls.playlists.media_.attributes, segmentInfo.cdn_request_id, segmentInfo.rtt);
    });

    //Cuando se llena el buffer
    this.player.on('waiting', function() {
      sdk.buffering(this.currentTime());
    });

    //se activa una vez que el reproductor ha estimado que tiene suficiente contenido multimedia en el búfer para //iniciar la reproducción
    this.player.on('canplaythrough', function() {
      // console.log("In canplaythrough ",this);
      let segmentInfo = utils.getSegmentInfo(this);
      // console.log("Segment Info :",segmentInfo);
      sdk.bufferCompleted(segmentInfo.cdn_request_id, segmentInfo.rtt);
    });

    //se dispara cada pocos milisegundos a medida que cambia la posición de reproducción
    this.player.on('timeupdate', function() {
      var intPlayedTime = parseInt(this.currentTime(), 10);
      let everyFiveSec = intPlayedTime % 5 === 0 && intPlayedTime !== 0;

      //procesa solo cadqa 15 segundos
      if (everyFiveSec) { 
        let segmentInfo = utils.getSegmentInfo(this);
        // console.log("In timeupdate ",this.tech_.hls.playlists.media_.segments);
        sdk.timeUpdate(this.currentTime(),this.duration(), segmentInfo.cdn_request_id,segmentInfo.rtt);
      }
    });

    this.player.on('seeking', sdk.seeking); // seeking =buscar
    this.player.on('seeked', function() {
      let segmentInfo = utils.getSegmentInfo(this);
      sdk.seeked(this.currentTime(),segmentInfo.cdn_request_id,segmentInfo.rtt);
    });

    //disparado cuando hay un cambio en la tasa de bits
    this.player.on('mediachange', function(event) {
      console.log("In mediachange :", this);
      sdk.step(this.tech_.hls.playlists.media_.attributes, utils.getPackageType(this), this.currentTime());
    });

    //se dispara cuando el reproductor video.js encuentra un 'error' en algun momento/tiempo de reproduccion
    this.player.on('error', function(err) {
      let segmentInfo = utils.getSegmentInfo(this);
      sdk.errorOccured(this.currentTime(), segmentInfo.cdn_request_id, err); 
    });

    //Se dispara cuando el video esta en pausa
    this.player.on('pause', sdk.pause);

    // Despedida cuando la reproduccion ha terminado
    this.player.on('ended', function() {
      sdk.ended(this.currentTime(), this.duration());
    });

    //
    // this.player.on('playing',function(){
    //   // console.log("In playing ",this);
    // });
    // this.player.on('progress', function(event) {
    //   // console.log("In progress ",this);
    // });
  }

  //-----Show activities in 'Metric Captured' component
  addTrail(message, at) {
    // console.log("In addTrail : %s %s",message,at);
    this.setState(oldState => ({
      trails: [{
        message: message,
        at: at
      }, ...oldState.trails],
    }));
  }

  getVideoId(url) { // aca le paso la URL del video
    var tempArray = url.split("/");
    var tempVideoName = tempArray[tempArray.length - 1].split(".")[0];
    return tempVideoName;
  }
 

  // destroy player on unmount
  /*componentWillUnmount() {
    if (this.player) {
      //this.player.dispose();
    }
  }*/

  handleChange(e) {
    console.log("In VideoJSPlayer.handleChange ",e.target.value);
    this.setState({ // le seteo un estado 
      videoUrl: e.target.value
    });
    
  }

  onPlay(e) { 
    // console.log("In play",e);
    //si el reproductor aún no se ha inicializado, no haga nada
    this.player.pause();

    let videoUrl = this.state.videoUrl; //seteo el estado y quiero la url

    if (videoUrl) {
      //for dash packaging
      if (videoUrl.endsWith(".mpd")) { //la url tiene que ser de tipo MPD
        this.player.src({
          src: videoUrl,
          type: 'application/dash+xml'
        });
      } else {
        this.player.src(videoUrl);
        
        
      }

      var videoId = this.getVideoId(this.player.src());
      // console.log("videoid ",videoId);
      this.setState(oldState => ({
        trails: [],
        videoid: videoId
      }));
      this.sdk.initialize(videoId);
      this.player.play();  //cuando le de play
      
    }
  }

  onPause(e) {
    // console.log("In pause");
    this.player.pause();
  }
  // wrap the player in a div with a `data-vjs-player` attribute
  // so videojs won't create additional wrapper in the DOM
  // see https://github.com/videojs/video.js/pull/3856
  render() {

    return (
      <React.Fragment>

            <div data-vjs-player>
           
    
              <video   ref={ node => this.videoNode = node } className="video-js vjs-default-skin"
      data-setup='{ "playbackRates": [0.5, 0.75, 1, 1.25, 1.5, 2] }'
      controls
     
     
      autoplay="true" 
      preload="auto" >
       
              </video>
               <source
        type="application/x-mpegURL"
        id="my-hls-source"
        
      />
             <video  onClick={this.onPlay}></video>
              <video onClick={this.onPause}></video>
           
            </div>
            
       
       
        <Grid item xs={6}>
        <ExpansionPanel defaultExpanded>
          

          <ExpansionPanelDetails>
            <List className="listroot">
              {this.state.trails.map((trail,index) => this.renderTrail(trail,index))}
            </List>
          </ExpansionPanelDetails>
        </ExpansionPanel>
        </Grid>
        </React.Fragment>
    )
  }

  renderTrail(trail,index){
  //  console.log("trail ",trail.uniqueId);
    return (
        <ListItem key={index} dense divider>
          <ListItemText primary={trail.message+' '+trail.at}/>
        </ListItem>
    );
  }
}