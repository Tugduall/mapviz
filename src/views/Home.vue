<template>
  <Toast position="top-right"/>

  <Menubar id="menu-bar">
    <template #start>
      <img id="logo" alt="Mapool logo" src="../assets/mapool_logo_3.png">
    </template>
    <template #end>
      <div class="flex flex-row">
        <!-- PayPal Donate -->
        <form action="https://www.paypal.com/cgi-bin/webscr" class="flex align-items-center justify-content-center"
              method="post">

          <!-- Identify your business so that you can collect the payments. -->
          <input name="business" type="hidden" value="launay.tug@gmail.com">

          <!-- Specify a Donate button. -->
          <input name="cmd" type="hidden" value="_donations">

          <!-- Specify details about the contribution -->
          <input name="item_name" type="hidden" value="Mapviz development">
          <input name="item_number" type="hidden" value="Help us to develop fancy new feature for Mapviz">
          <input name="currency_code" type="hidden" value="EUR">

          <!-- Display the payment button. -->
          <input alt="Donate" name="submit"
                 src="https://www.paypalobjects.com/en_US/i/btn/btn_donate_LG.gif"
                 type="image">
          <img alt="" height="1" src="https://www.paypalobjects.com/en_US/i/scr/pixel.gif"
               width="1">

        </form>
      </div>
    </template>
  </Menubar>

  <div id="container">
    <div id="mapContainer"></div>
  </div>


  <div id="side-container">

    <Card class="t-card mb-2">
      <template #title>
        Waypoints

        <Button class="p-button-rounded p-button-text" icon="pi pi-question-circle" style="float: right;" type="button"
                @click="toggle"/>
        <OverlayPanel ref="op" :dismissable="true" :showCloseIcon="true">
          <p class="font-bold text-center">Accepted format of coordinates</p>
          <p><span class="font-bold">Separator :</span> commas, semi-colons, space or tabulation </p>
          <p class="font-bold">Sample :</p>
          <p>46.961890, -2.886923</p>
          <p>46.961890; -2.886923</p>
          <p>46.961890 -2.886923</p>
        </OverlayPanel>
      </template>
      <template #content>
        <div class="grid">
          <div class="col-5">
            <p class="m-0 mb-1 font-medium">Name</p>
            <InputText v-model="currentWaypoints.name" required type="text"/>
          </div>
          <div class="col-4">
            <p class="m-0 mb-1 font-medium">Color</p>
            <div class="flex flex-row flex-nowrap align-items-center">
              <ColorPicker :modelValue="currentWaypoints.color" class="mr-1"
                           @update:modelValue="currentWaypoints.color = $event; createFeatureGroup(currentWaypoints)"/>
              <InputText v-model="currentWaypoints.color" type="text"/>
            </div>
          </div>
          <div class="col-3">
            <p class="m-0 mb-1 font-medium">Shape</p>
              <Dropdown v-model="currentWaypoints.shape" :options="shapes" class="mr-1"
                        optionLabel="name" @change="createFeatureGroup(currentWaypoints)">
                <template #value="shape">
                  <div class="flex flex-row justify-content-center" v-html="shape.value.icon"></div>
                </template>
                <template #option="shape">
                  <div class="flex flex-row justify-content-center" v-html="shape.option.icon"></div>
                </template>
              </Dropdown>
          </div>
          <div class="col-12">
            <Textarea v-model="waypointInputValue" rows="6" @change="formatWaypoints"/>
          </div>
        </div>
        <Button :disabled="waypointInputValue === ''" class="p-button-sm p-button-outlined" icon="pi pi-check"
                iconPos="left" label="Save Waypoints"
                @click="saveWaypoints"/>
      </template>
    </Card>

    <Card class="t-card mb-2">
      <template #title>
        Waypoint lists
      </template>
      <template #content>

        <div class="saved-waypoints-list">
          <div v-for="(waypoint, index) in savedWaypoints" :key="'swp_'+index"
               class="flex flex-row flex-nowrap align-items-center justify-content-between mb-2">
            <p class="capitalize m-0">{{ waypoint.name }}</p>
            <div class="flex flex-row justify-content-end align-items-center">
              <Button v-tooltip="'View waypoint list'" class="p-button-sm p-button-outlined mr-1"
                      @click="displayWaypointsDialog = true">
                Waypoints
              </Button>
              <Dialog v-model:visible="displayWaypointsDialog" :modal="true" header="Waypoints"
                      style="max-width: 40vw; min-width: 20vw;">
                <div class="waypoint-list">
                  <template v-for="(wp, index) in waypoint.latLngs" :key="'wp_'+index">
                    <p class="m-0 mb-1">{{ wp[0] }}, {{ wp[1] }}</p>
                  </template>
                </div>
              </Dialog>
              <Dropdown v-if="waypoint.markers.length > 1" v-model="waypoint.shape" :options="shapes" class="mr-1"
                        optionLabel="name" @change="createFeatureGroup(waypoint)">
                <template #value="shape">
                  <div class="flex flex-row justify-content-center" v-html="shape.value.icon"></div>
                </template>
                <template #option="shape">
                  <div class="flex flex-row justify-content-center" v-html="shape.option.icon"></div>
                </template>
              </Dropdown>
              <ColorPicker :modelValue="waypoint.color" class="mr-1"
                           @update:modelValue="waypoint.color = $event; createFeatureGroup(waypoint)"/>
              <Button v-tooltip.left="'Hide / Show'" class="p-button-outlined p-button-sm mr-1 p-button-secondary"
                      icon="pi pi-eye"
                      @click="toggleVisibility(waypoint)"></Button>
              <Button v-tooltip.left="'Delete saved waypoints'" class="p-button-sm p-button-danger p-button-outlined"
                      icon="pi pi-trash"
                      iconPos="left" @click="deleteSavedWaypoint(index)"/>
            </div>
          </div>
        </div>

        <p v-if="savedWaypoints.length === 0" class="text-center m-0 text-gray-500">No waypoints saved yet</p>
      </template>
    </Card>

    <Accordion :multiple="true">
      <AccordionTab header="Decimal Degree to Degree Minute Second">
        <div class="flex flex-row align-items-center justify-content-around  pt-3">
          <span class="p-float-label">
              <InputNumber id="inputDecimalDegree" v-model="converter.ddInputValue" :minFractionDigits="2"
                           mode="decimal"/>
              <label for="inputDecimalDegree">Decimal Degree</label>
          </span>
          <Button label="Convert" @click="ddToDms(converter.ddInputValue)"/>
        </div>
        <p class="text-center">{{ converter.ddToDmsResult }}</p>
      </AccordionTab>
      <AccordionTab header="Degree Minutes Second to Decimal Degree">
        <div class="flex flex-row justify-content-around pt-3">
          <span class="p-float-label w-5rem">
              <InputNumber id="inputDegree" v-model="converter.dmsInputValues.minutes"/>
              <label for="inputDegree">Degree</label>
          </span>
          <span class="p-float-label w-5rem">
              <InputNumber id="inputMinute" v-model="converter.dmsInputValues.minutes"/>
              <label for="inputMinute">Minute</label>
          </span>
          <span class="p-float-label w-5rem">
              <InputNumber id="inputSecond" v-model="converter.dmsInputValues.degrees"/>
              <label for="inputSecond">Second</label>
          </span>
          <Button label="Convert" @click="dmsToDd(converter.dmsInputValues)"/>
        </div>
        <p class="text-center">{{ converter.dmsToDdResult }}</p>
      </AccordionTab>
    </Accordion>

  </div>
</template>

<script>
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import Menubar from "primevue/menubar";
import InputText from "primevue/inputtext";
import ColorPicker from "primevue/colorpicker";
import Button from "primevue/button";
import Card from "primevue/card";
import Textarea from "primevue/textarea";
import Dropdown from "primevue/dropdown";
import InputNumber from "primevue/inputnumber";
import Accordion from "primevue/accordion";
import AccordionTab from "primevue/accordiontab";
import Toast from "primevue/toast";
import OverlayPanel from "primevue/overlaypanel";
import Dialog from "primevue/dialog";

export default {
  name: "Home",
  components: {
    Menubar,
    InputText,
    ColorPicker,
    Button,
    Card,
    Textarea,
    Dropdown,
    InputNumber,
    Accordion,
    AccordionTab,
    Toast,
    OverlayPanel,
    Dialog,
  },
  data() {
    return {
      displayWaypointsDialog: false,
      converter: {
        ddInputValue: null,
        ddToDmsResult: null,
        dmsInputValues: {
          degrees: null,
          minutes: null,
          seconds: null,
        },
        dmsToDdResult: null,
      },
      // Map
      map: null,
      center: [37, 7749, -122, 4194],
      // Data
      shapes: [
        {
          name: 'polylines',
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-dash" viewBox="0 0 16 16"><path d="M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8z"/></svg>'
        },
        {
          name: 'rectangle',
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-square" viewBox="0 0 16 16"><path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/></svg>'
        },
        {
          name: 'polygon',
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pentagon" viewBox="0 0 16 16"><path d="m8 1.288 6.842 5.56L12.267 15H3.733L1.158 6.847 8 1.288zM16 6.5 8 0 0 6.5 3 16h10l3-9.5z"/></svg>'
        },
        {
          name: 'waypoints',
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-geo-alt" viewBox="0 0 16 16"><path d="M12.166 8.94c-.524 1.062-1.234 2.12-1.96 3.07A31.493 31.493 0 0 1 8 14.58a31.481 31.481 0 0 1-2.206-2.57c-.726-.95-1.436-2.008-1.96-3.07C3.304 7.867 3 6.862 3 6a5 5 0 0 1 10 0c0 .862-.305 1.867-.834 2.94zM8 16s6-5.686 6-10A6 6 0 0 0 2 6c0 4.314 6 10 6 10z"/><path d="M8 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 1a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/></svg>'
        },
      ],
      savedWaypoints: [],
      waypointInputValue: "",
      currentWaypoints: {
        latLngs: [],
        formattedLatLngs: "",
        color: '1976D2',
        name: '',
        visible: true,
        shape: {
          name: 'polylines',
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-dash" viewBox="0 0 16 16"><path d="M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8z"/></svg>'
        },
        markers: [],
        featureGroup: null,
      },
    }
  },
  methods: {

    setupLeafletMap: function () {
      this.map = L.map("mapContainer", {center: [51, 0], zoom: 4});
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(this.map);
    },

    toggle(event) {
      this.$refs.op.toggle(event);
    },

    toggleVisibility(current) {
      current.visible = !current.visible
      if (current.featureGroup != null && !current.visible) {
        this.map.removeLayer(current.featureGroup)
      } else {
        this.createFeatureGroup(current)
      }
    },

    createFeatureGroup(current) {
      if (current.latLngs.length === 0) {
        return
      }

      if (current.featureGroup != null) {
        this.map.removeLayer(current.featureGroup)
      }
      current.featureGroup = L.featureGroup().addTo(this.map)
      current.markers = []

      current.latLngs.forEach(ll => {
        let marker = L.circleMarker(ll, {color: '#' + current.color})
        current.markers.push(marker)
        marker.addTo(current.featureGroup)
      });

      if (current.markers.length > 1) {
        if (current.shape.name === 'polylines') {
          L.polyline(current.latLngs, {color: '#' + current.color}).addTo(current.featureGroup);
        } else if (current.shape.name === 'rectangle') {
          L.rectangle(current.featureGroup.getBounds(), {
            color: '#' + current.color,
            weight: 1
          }).addTo(current.featureGroup);
        } else if (current.shape.name === 'polygon') {
          if (current.latLngs.length > 2) {
            L.polygon(current.latLngs, {color: current.color}).addTo(current.featureGroup);
          } else {
            this.$toast.add({
              severity: 'warn',
              summary: 'Warning',
              detail: 'A polygon requires more than 2 waypoints',
              life: 3000
            });
          }
        }
      }

      this.map.fitBounds(current.featureGroup.getBounds(), {padding: [100, 100]});
      this.map.setZoom(4)
    },

    formatWaypoints(evt) {
      let inputValue = evt.target.value

      this.currentWaypoints.latLngs = [];
      this.currentWaypoints.formattedLatLngs = "";
      this.currentWaypoints.markers = [];

      let coordinates = inputValue.split('\n').filter(itm => itm !== "");
      coordinates.forEach((c, index) => {
        if (index > 0) {
          this.currentWaypoints.formattedLatLngs += ' / '
        }
        let strCoordinates = c.split(/[\s,; \r]+/);
        let latLng = [Number(strCoordinates[0]), Number(strCoordinates[1])]
        this.currentWaypoints.formattedLatLngs += `${strCoordinates[0]}, ${strCoordinates[1]}`
        this.currentWaypoints.latLngs.push(latLng);
      });

      this.createFeatureGroup(this.currentWaypoints)
    },

    saveWaypoints() {
      if (this.currentWaypoints.coordinates === "") {
        alert("You must enter waypoints to save")
      } else {

        if (this.currentWaypoints.name === "") {
          this.currentWaypoints.name = 'Route ' + (this.savedWaypoints.length + 1)
        }

        this.savedWaypoints.push(this.currentWaypoints);
        this.waypointInputValue = "";
        this.currentWaypoints = {
          formattedLatLngs: "",
          latLngs: [],
          color: '1976D2',
          name: '',
          visible: true,
          shape: this.shapes[0],
          markers: [],
          featureGroup: null,
        };
      }
    },

    deleteSavedWaypoint(index) {
      this.map.removeLayer(this.savedWaypoints[index].featureGroup)
      this.savedWaypoints.splice(index, 1)
    },

    ddToDms(number) {
      let d = Math.trunc(number)
      let m = Math.trunc((number - d) * 60)
      let s = Math.trunc((number - d - m / 60) * 3600)
      this.converter.ddToDmsResult = `${d}° ${m}' ${s}"`
    },

    dmsToDd(values) {
      this.converter.dmsToDdResult = (values.degrees + values.minutes / 60 + values.seconds / 3600).toFixed(5) + ' °'
    },
  },
  mounted() {
    this.setupLeafletMap();
  },
}
</script>

<style lang="scss" scoped>
::v-deep {
  .p-accordion-tab {
    margin-bottom: 0.5rem;
  }
}

.p-overlaypanel-close .p-link {
  z-index: 999 !important;
}

#menu-bar {
  height: 5vh;

  #logo {
    height: 3.5vh;
    width: auto
  }
}

#side-container {
  z-index: 2;
  position: fixed;
  top: calc(5vh + 1em);
  right: 1em;
  width: 400px;
}

#mapContainer {
  z-index: 1;
  width: 100vw;
  height: 95vh;
}

.waypoint-list, .saved-waypoints-list {
  max-height: 30vh;
  overflow-y: auto;
}

::-webkit-scrollbar {
  width: 5px;
  border-radius: 4px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #d7d7d7;
}

::-webkit-scrollbar-thumb:hover {
  background: #9d9d9d;
}


</style>
