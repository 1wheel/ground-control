import React from 'react';
import BernieLogo from './BernieLogo';
import {BernieColors, BernieText} from './styles/bernie-css';
import {BernieTheme} from './styles/bernie-theme';
import {AppBar, Styles, Tabs, Tab} from 'material-ui';

@Styles.ThemeDecorator(Styles.ThemeManager.getMuiTheme(BernieTheme))
export default class TopBar extends React.Component {
  static propTypes = {
    logoColors: React.PropTypes.shape({
      primary: React.PropTypes.string,
      swoosh: React.PropTypes.string
    }),
    tabs: React.PropTypes.arrayOf(React.PropTypes.shape({
      label: React.PropTypes.string,
      onClick: React.PropTypes.func,
    })),
    color: React.PropTypes.string,
    tabColor: React.PropTypes.string,
    selectedTabColor: React.PropTypes.string,
    titleColor: React.PropTypes.string
  }

  styles = {
    logo: {
      width: 96,
      height: 40
    },
    bar: {
      height: 56
    },
    tab: {
      ...BernieText.secondaryTitle,
      fontSize: '1rem',
    }
  }

  render() {
    let tabs = []
    this.props.tabs.forEach((tab) => {
      tabs.push(<Tab label={tab.label} style={{
        ...this.styles.tab,
        color: this.props.tabColor
      }} />)
    })
    return (
      <AppBar
        {...this.props}
        iconElementLeft={
          <BernieLogo
            color={this.props.logoColors.primary}
            bottomSwooshColor={this.props.logoColors.swoosh}
            viewBox="0 0 480 200"
            style={this.styles.logo}
        />}
        iconElementRight={
          <Tabs>
            {tabs}
          </Tabs>
        }
      />
    )
  }
}