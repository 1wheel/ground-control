import React from 'react';

// This will match the path to a set of prop names and also set those props as relay variables
export default function Route(matchString) {
  return function (DecoratedComponent) {
    return class extends React.Component {
      static propTypes = {
        parentPath: React.PropTypes.string.isRequired,
        path: React.PropTypes.string.isRequired,
        navigateTo: React.PropTypes.func.isRequired
      }

      propNameFromMatchPart(part) {
        if (part && part[0] == ':')
          return part.substring(1)
        return null;
      }

      propsFromPath() {
        let matchParts = matchString.split('/')
        let propMap = {}
        matchParts.forEach((part) => {
          let propName = this.propNameFromMatchPart(part)
          if (propName)
            propMap[propName] = null;
        })

        let pathParts = this.props.path.split('/')
        for (let index = 0; index < pathParts.length; index++) {
          let match = this.propNameFromMatchPart(matchParts[index])
          if (match)
            propMap[match] = pathParts[index];
        }
        return propMap;
      }

      // This is a bit of a hack to also set the props as relay variables
      componentDidUpdate() {
        if (this.props.relay) {
          this.props.relay.setVariables(this.propsFromPath())
        }
      }

      componentDidMount() {
        this.componentDidUpdate()
      }

      render() {
        let navigateTo = (path) => {
          let parentPath = this.props.parentPath;
          let childPath = this.props.path;
          this.props.navigateTo(parentPath.substring(0, parentPath.indexOf(childPath)) + path);
          }
        let props = {
          ...this.propsFromPath(),
          ...this.props,
          navigateTo: navigateTo
        }
        return (
          <DecoratedComponent {...props} />
        );
      }
    }
  }
}