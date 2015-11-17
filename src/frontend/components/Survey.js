import React from 'react';
import Relay from 'react-relay';
import Radium from 'radium';
import {RaisedButton} from 'material-ui';

// This just handles rendering and interacting with a BSD survey in an iFrame
@Radium
class Survey extends React.Component {
  styles = {
    container: {
      width: '100%',
    },
    frame: {
      display: 'block',
      border: 'none',
      width: '100%',
      height: 0,
    }
  }

  static propTypes = {
    onSubmit : React.PropTypes.func
  }

  static defaultProps = {
    onSubmit : () => { }
  }

  state = {
    frameStyle : {height: 0},
  }

  submit = () => {
    this.sendFrameMessage({message: 'submit'})
  }

  frameMessageHandler = (event) => {
    if (event.origin !== this.frameHost())
      return;

    if (event.data.message == 'documentLoaded') {
      if (event.data.details.location === this.props.survey.BSDData.fullURL) {
        Object.keys(this.props.initialValues).forEach((fieldId) => {
          this.sendFrameMessage({
            message: 'setInputValue',
            details: {
              inputId: fieldId,
              value: this.props.initialValues[fieldId]
            }})
        })
        this.sendFrameMessage({message: 'getHeight'});
      }
      else {
        this.props.onSubmit();
      }
    }

    else if (event.data.message == 'documentHeight')
      this.setState({frameStyle: {height: event.data.details.height}})
  }

  sendFrameMessage(message) {
    this.refs.frame.contentWindow.postMessage(message, this.frameHost())
  }

  componentDidMount() {
    window.addEventListener('message', this.frameMessageHandler)
  }

  componentWillUnmount() {
    window.removeEventListener('message', this.frameMessageHandler);
  }

  hostFromURLString(URLString) {
    return URLString.split('/').slice(0, 3).join('/');
  }

  frameHost() {
    return this.hostFromURLString(this.props.survey.BSDData.fullURL);
  }

  render() {
    let source = this.props.survey.BSDData.fullURL;
    let frame = (
      <iframe
        ref='frame'
        scrolling='no'
        src={source}
        style={[this.styles.frame, this.state.frameStyle]}
        onLoad={this.frameLoaded}
      />
    )

    return (
      <div style={this.styles.container}>
        {frame}
      </div>
    )
  }
}

export default Relay.createContainer(Survey, {
  fragments: {
    survey: () => Relay.QL`
      fragment on Survey {
        BSDData {
          fullURL
        }
      }
    `
  }
})