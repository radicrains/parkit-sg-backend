import React from 'react';
import H from "@here/maps-api-for-javascript";
import onResize from 'simple-element-resize-detector';

export default class Map extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      addContainer: false,
      mapArea: '',
      zoom: 0,
      lat: 0,
      lng: 0,
    }
   
    this.container = null;

    // the reference to the container
    this.ref = React.createRef();
    // reference to the map
    this.map = null;
  }

  getMarker = () =>  {
    console.log(this.state.addContainer)
    if(this.state.addContainer) {
      this.container.removeObjects(this.container.getObjects())
    }
    this.props.area.map( async (carpark, index) => {
      try {
          const response = await fetch(`https://calvan-proxy.herokuapp.com/https://developers.onemap.sg/commonapi/convert/3414to3857?X=${carpark.x_coord}&Y=${carpark.y_coord}`, {
              headers: {
                  'Accept': 'application/json, text/plain, */*',
                  'Content-Type': 'application/json',
              },
              method: 'GET',
          });
          console.log(response);
          const fetched3857 = await response.json();
          console.log(fetched3857);
          const convertedx = fetched3857.X;
          const convertedy = fetched3857.Y;
          const response_1 = await fetch(`https://calvan-proxy.herokuapp.com/https://developers.onemap.sg/commonapi/convert/3857to4326?X=${convertedx}&Y=${convertedy}`, {
              headers: {
                  'Accept': 'application/json, text/plain, */*',
                  'Content-Type': 'application/json',
              },
              method: 'GET',
          });
          console.log(response_1);
          const coord = await response_1.json()
          console.log(coord)
          const lat = parseFloat(coord.latitude)
          const lng = parseFloat(coord.longitude)
          const marker = new H.map.Marker({lat:lat, lng:lng});
          marker.setData(carpark);
          marker.addEventListener('tap', (event) => {
          console.log(event.target.getData());
          const markerDetail = event.target.getData();
          this.props.onClickMarker(markerDetail);
          })
      this.container.addObject(marker)
      this.setState({lat: lat, lng: lng})
      console.log(this.state.lat);
      console.log(this.state.lng);
      } catch (err) {
        return console.log(err);
      }
    })
    this.map.addObject(this.container)

  }

  componentDidMount() {
    console.log('...mounting map');
    // instantiate a platform, default layers and a map as usual
    const platform = new H.service.Platform({
    apikey: 'lWuHiqHF3US-TtO2Xt7u6rDZr2tjAAftuXnhwVAgZ3s'
    });
    const layers = platform.createDefaultLayers();
    const map = new H.Map(
    this.ref.current,
    layers.vector.normal.map,
    {
      pixelRatio: window.devicePixelRatio,
      center: {lat: 1.2851962650166864, lng: 103.81800888261792},
      zoom: 10,
    },
    );
    onResize(this.ref.current, () => {
    map.getViewPort().resize();
    });
    this.map = map;

    const container = new H.map.Group()
    this.container = container

    // add the interactive behaviour to the map
    new H.mapevents.Behavior(new H.mapevents.MapEvents(map));
  }

  componentDidUpdate() {
    if(this.props.area !== this.state.mapArea) {
      console.log('...updating')
      console.log(this.props.area)
      this.getMarker()
      const timer = setTimeout(() => {

        this.map.setCenter({lat: this.state.lat, lng: this.state.lng});
        this.map.setZoom(17);
      }, 10000)
      // clearTimeout(timer);
      this.setState({mapArea: this.props.area})
      this.setState({addContainer: true})
    }
  }

  render() {
    return (
      <React.Fragment>
        <div
          style={{ width: '100%', height:'300px' }}
          ref={this.ref} 
        />
      </React.Fragment>
    )
  }

}




////GRAVEYARD CODE////

  // fetchHelper = async (url) => {
  //   try {
  //     const response = await fetch(url, {
  //       headers: {
  //           'Accept': 'application/json, text/plain, */*',
  //           'Content-Type': 'application/json',
  //       },
  //       method: 'GET',
  //     })
  //     return response;
  //   }
  //   catch (err) {
  //     console.log(err)
  //   }
  // }

   // handleMapViewChange = (ev) => {
  //   const {
  //     onMapViewChange
  //   } = this.props;
  //   if (ev.newValue && ev.newValue.lookAt) {
  //     const lookAt = ev.newValue.lookAt;
  //     // adjust precision
  //     const lat = Math.trunc(lookAt.position.lat * 1E7) / 1E7;
  //     const lng = Math.trunc(lookAt.position.lng * 1E7) / 1E7;
  //     const zoom = Math.trunc(lookAt.zoom * 1E2) / 1E2;
  //     onMapViewChange(zoom, lat, lng);
  //     console.log('this ran...')
  //   }
  // }
