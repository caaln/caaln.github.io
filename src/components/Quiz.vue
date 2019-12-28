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
    <div id="map" ref="map" class="flex-grow-1 w-100 h-100"></div>
  </div>
</template>

<script>
import firebase from 'firebase/app';

import gmapsInit from '@/utils/gmaps';
import firebaseInit from '@/utils/firebase';

/* eslint-disable no-new */
export default {
  name: 'quiz',
  props: {
    uid: {
      type: String,
      required: true,
    },
    setMode: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      submitting: false,
      questions: [],
      answers: [],
      number: 0,
      ansLat: undefined,
      ansLng: undefined,
      marker: undefined,
    };
  },
  async mounted() {
    firebaseInit().database().ref('question')
      .on('value', (d) => {
        this.questions = d.val() || [];
      });

    firebaseInit().database().ref(`answer/${this.uid}`)
      .on('value', (d) => {
        this.answers = d.val();
        if (this.answers) {
          this.number = Math.max(
            ...[...this.answers.entries()].filter(([, v]) => v).map(([k]) => k),
          ) + 1;
        }
      });

    const google = await gmapsInit();
    const map = new google.maps.Map(this.$refs.map, {
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

    map.addListener('click', (e) => {
      this.ansLat = e.latLng.lat();
      this.ansLng = e.latLng.lng();
      if (this.marker) {
        this.marker.setMap(null);
      }
      this.marker = new google.maps.Marker({ position: e.latLng, map });
    });
  },
  methods: {
    submitAnswer() {
      if (this.submitting) {
        return;
      }
      this.submitting = true;

      const data = {
        lat: this.ansLat,
        lng: this.ansLng,
        time: firebase.database.ServerValue.TIMESTAMP,
      };

      this.ansLat = null;
      this.ansLng = null;
      if (this.marker) {
        this.marker.setMap(null);
      }

      if (this.setMode) {
        firebaseInit().database().ref(`question/${this.number}`).set(data, () => {
          this.submitting = false;
          this.number += 1;
        });
      } else {
        firebaseInit()
          .database()
          .ref(`answer/${this.uid}/${this.number}`)
          .push(data, () => {
            this.submitting = false;
          });
      }
    },
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
