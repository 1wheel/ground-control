import {Styles} from 'material-ui';

export const BernieColors = {
  blue: 'rgb(20, 127, 215)',
  red: 'rgb(245, 91, 91)',
  darkRed: 'rgb(237, 60, 57)',
  green: 'rgb(74, 204, 102)',
  gray: 'rgb(54, 67, 80)',
  lightGray: 'rgb(239, 243, 247)',
}

export const BernieStyles = {
  bodyText: {
    color: BernieColors.gray
  },

  title: {
    color: BernieColors.blue,
    fontSize: 38,
    fontWeight: 500
  },

  whiteTitle: {
    color: Styles.Colors.white,
    fontSize: 38,
    fontWeight: 500
  }
}