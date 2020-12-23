<template>
  <div class="d-flex flex-column min-vh-100">
    <div id="head" class="p-1 flex-grow-0">
      <div class="dropdown float-left mr-2">
        <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton"
                data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">

        </button>
        <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
          <a class="dropdown-item" @click="$emit('set-name', null)">Set Name</a>
          <template v-for="(a,n) in questions">
            <a class="dropdown-item" :key="n" @click="number = n">
              Question {{ n }}
            </a>
          </template>
        </div>
      </div>

      <button id="submit" class="btn btn-primary float-right"
              v-if="ansLat !== undefined && ansLng !== undefined"
              :disabled="submitting"
              @click="submitAnswer">Submit</button>
      <h2 id="number" class="m-0">Question {{ number }}</h2>
    </div>

    <div class="answer">
      <div v-if="question.type === 'latLng'" id="map" ref="map" class="flex-grow-1 w-100 h-100" />
      <input v-else-if="question.type === 'text'" type="text" @change="setAnswer" />
    </div>
  </div>
</template>

<script>
import gmapsInit from '@/utils/gmaps';

const google = gmapsInit();

/* eslint-disable no-new */
export default {
  name: 'quiz',
  props: {
    value: {
      type: Array,
      default: () => null,
    },
    setMode: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      map: undefined,
      marker: undefined,
    };
  },
  watch: {
    value: {
      async handler(v) {
        if (this.marker) {
          this.marker.setMap(null);
        }
        this.marker = new (await google).maps.Marker({
          position: v,
          map: this.map,
        });
      },
      immediate: true,
    },
  },
  async mounted() {
    this.map = new (await google).maps.Map(this.$refs.map, {
      center: { lat: 53.3502709, lng: -0.6932712 },
      zoom: 2,
      disableDefaultUI: true,
      zoomControl: true,
      mapTypeControl: false,
      scaleControl: false,
      streetViewControl: false,
      rotateControl: false,
      fullscreenControl: false,
      styles: this.setMode ? [] : [
        {
          featureType: 'administrative',
          stylers: [{ visibility: 'off' }],
        },
        {
          featureType: 'poi',
          stylers: [{ visibility: 'off' }],
        },
        {
          featureType: 'road',
          stylers: [{ visibility: 'off' }],
        },
        {
          featureType: 'transit',
          stylers: [{ visibility: 'off' }],
        },
        {
          featureType: 'water',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }],
        },
      ],
    });

    this.map.addListener('click', (e) => {
      this.$emit('change', [e.latLng.lat(), e.latLng.lng()]);
    });
  },
};
</script>

<style>
html,
body {
  margin: 0;
  padding: 0;
}
#map {
  width: 100vw;
  height: 100vh;
}
</style>
