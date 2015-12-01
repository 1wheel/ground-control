import React from 'react';
import Relay from 'react-relay';
import {Paper, TextField} from 'material-ui';
import {BernieText, BernieColors} from './styles/bernie-css';
import GCForm from './forms/GCForm';
import Form from 'react-formal';
import yup from 'yup';
import superagent from 'superagent';

export default class Signup extends React.Component {
  state = {
    formState : 'signup',
    errorMessage: null
  }

  clearError() {
    this.setState({errorMessage: null})
  }

  formStates = {
    login: {
      formTitle: 'Login to get started',
      formSchema: yup.object({
        email: yup.string().email().required(),
      }),
      formElement: (
        <div>
          <Form.Field
            name='email'
            label='E-mail Address'
          />
          <Form.Field
            name='password'
            label='Password'
          />
        </div>
      ),
      onSubmit: (formState) => {
        superagent
          .post('/login')
          .send({
            email: formState.email,
            password: formState.password
          })
          .end((err, res) => {
            console.log(err, res)
            if (!err)
              window.location = '/call-assignments';
              // Ideally this would work with pushState, but it doesn't because relay has already cached the current user and has no idea that things are session-based.
              //this.props.history.pushState(null, '/call-assignments')
            else
              this.setState({errorMessage: 'Incorrect login or password'});
          })
      }
    },
    signup: {
      formTitle: 'Login or sign up make calls',
      formSchema: yup.object({
        email: yup.string().required().email(),
        password: yup.string().required(),
      }),
      formElement: (
        <div>
          <Form.Field
            name='email'
            label='E-mail Address'
          /><br />
          <Form.Field
            name='password'
            label='Password'
          /><br />
        </div>
      ),
      onSubmit: (formState) => {
        superagent
          .post('/signup')
          .send({
            email: formState.email,
            password: formState.password
          })
          .end((err, res) => {
            console.log(err, res)
            if (!err)
              window.location = '/call-assignments';
              // Ideally this would work with pushState, but it doesn't because relay has already cached the current user and has no idea that things are session-based.
              //this.props.history.pushState(null, '/call-assignments')
            else
              this.setState({errorMessage: 'Incorrect e-mail or password'});
          })
      }
    }
  }

  styles = {
    signupForm: {
      width: '100%',
      backgroundColor: BernieColors.blue,
      color: BernieColors.white,
      padding: '15px 15px 15px 15px'
    },
    paragraph: {
      paddingTop: '0.5em',
      paddingBottom: '0.5em',
      paddingLeft: '0.5em',
      paddingRight: '0.5em',
    },
    introContainer: {
      display: 'flex',
      flexDirection: 'row'
    },
    introTextContainer: {
      flex: 1,
      marginRight: 40
    },
    signupFormContainer: {
      flex: 'auto',
      width: '12em'
    },
    container: {
      padding: 40,
      paddingTop: 40,
      paddingRight: 40,
      paddingBottom: 40,
    },
    errorMessage: {
      ...BernieText.default,
      color: BernieColors.red,
      fontSize: '0.8em',
      marginTop: 15
    }
  }

  renderSplash() {
    return (
      <div style={this.styles.container} >
        <div style={this.styles.introContainer}>
          <div style={this.styles.introTextContainer}>
            <div style={{
              ...BernieText.secondaryTitle,
              display: 'block'
            }}>
              Make Calls
            </div>
            <div style={BernieText.title}>
              Let them hear you loud and clear
            </div>
            <div style={BernieText.default}>
              <p style={this.styles.paragraph}>
                Get riled up get riled up get riled up get riled up.
                </p>
                <p style={this.styles.paragraph}>
                  Are you riled yet?  Get riled up a bit more.
                </p>
                <p style={this.styles.paragraph}>
                  Ok calm down now.
                </p>
                <p style={this.styles.paragraph}>
                  Thanks for all you do,
                </p>
                <img src='https://s.bsd.net/bernie16/main/page/-/Email%20Images/sig-red.png' width='170' alt='Bernie' />
            </div>
          </div>
          <div styles={this.styles.signupFormContainer}>
            {this.renderSignupForm()}
          </div>
        </div>
      </div>
    )
  }

  renderSignupForm() {
    let signupState = this.formStates[this.state.formState];
    let formElement = signupState.formElement;
    let formTitle = signupState.formTitle;
    let formSchema = signupState.formSchema;
    let submitHandler = signupState.onSubmit;
    let errorElement = <div></div>
    if (this.state.errorMessage) {
      errorElement = <div style={this.styles.errorMessage}>{this.state.errorMessage}</div>
    }
    return (
      <Paper style={this.styles.signupForm}>
        <div style={
          {
            ...BernieText.title,
            color: BernieColors.white,
            fontSize: '1.5em'
          }}>
          <GCForm
            schema={formSchema}
            onSubmit={(formData) => {
              submitHandler(formData)
            }}
          >
            {formTitle}
            {errorElement}
            <Paper zDepth={0} style={{
              padding: '15px 15px 15px 15px',
              marginTop: 15,
              marginBottom: 15
            }}>
              {formElement}
            </Paper>
              <Form.Button
                type='submit'
                label='Go!'
                fullWidth={true}
              />
              <div style={{
                ...BernieText.default,
                fontSize: '0.7em',
                color: BernieColors.white,
                marginTop: 10
              }}>
              </div>
          </GCForm>
        </div>
      </Paper>
    )
  }

  render() {
    return this.renderSplash();
  }
}