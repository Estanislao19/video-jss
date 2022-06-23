import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import TextField from '@material-ui/core/TextField';
import Tooltip from '@material-ui/core/Tooltip';
import AppSync from '../sdk/aws-exports.js';

const styles = (theme) => ({
  root: {
    width: '100%',
    backgroundColor: theme.palette.background.paper,
  },
});

class SampleVideos extends React.Component {

  constructor(props) {
    super(props);
    this.state = {videos:[]}; //seteo el estado videos como un arreglo vacio de obj?
  }

  componentDidMount() { //sample videos = lista de videos
    // console.log("In SampleVideos.componentDidMount");
    fetch('videos.json').then(data => data.json())
    .then(data => {
      this.setState({videos: data}); // al video le paso la data que me llega y se empieza a montar el video
      console.log("fetched sample video URLs ",this.state.videos);
    });
  }

  render() {
    // console.log("In SampleVideos.render :",this.props);
    const { classes } = this.props;

    const samples = (
    <React.Fragment>
    <List component="nav" className="listroot">
      {this.state.videos.map((video,index) =>
        <Tooltip title="click to select" key={index}>
        <ListItem button onClick={this.props.handleChange}>
          <TextField defaultValue={window.location.href.replace(window.location.pathname,"")+video.url} fullWidth/>
        </ListItem>
        </Tooltip>
      )}
    </List>
    </React.Fragment>
    );

    return (
      <div className={classes.root}>
        {samples} {/* Le paso el renderizado */}
        </div>
    );
  }
}

SampleVideos.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(SampleVideos); //exporto el estilo y la clase