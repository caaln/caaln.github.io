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

      <button class="btn btn-primary float-right ml-1"
              :disabled="!revealed"
              @click="number += 1">Next</button>
      <button id="submit" class="btn btn-primary float-right"
              :disabled="revealed"
              @click="revealAnswer">Reveal</button>
      <h2 id="number" class="m-0">Question {{ number }}</h2>
    </div>
    <div id="map" ref="map" class="flex-grow-1 w-100 h-100"></div>
  </div>
</template>

<script>
import gmapsInit from '@/utils/gmaps';
import firebaseInit from '@/utils/firebase';

/* eslint-disable no-new */
export default {
  name: 'admin',
  data() {
    return {
      map: null,
      users: [],
      questions: [],
      answers: [],
      number: 0,
      revealed: false,
      markers: [],
    };
  },
  watch: {
    number() {
      this.markers.forEach((v) => {
        v.setMap(null);
      });
      this.markers = [];
      this.revealed = false;

      this.addAnswers();
    },
  },
  async mounted() {
    const google = await gmapsInit();
    this.map = new google.maps.Map(this.$refs.map, {
      center: { lat: 53.3502709, lng: -0.6932712 },
      zoom: 2,
      disableDefaultUI: true,
      zoomControl: true,
      mapTypeControl: true,
      scaleControl: false,
      streetViewControl: false,
      rotateControl: false,
      fullscreenControl: false,
    });

    firebaseInit().database().ref('question')
      .on('value', (d) => {
        this.questions = d.val() || [];
      });

    firebaseInit().database().ref('user')
      .on('value', (d) => {
        this.users = d.val();
      });

    firebaseInit().database().ref('answer')
      .on('value', (d) => {
        this.answers = d.val();
        this.addAnswers();
      });
  },
  methods: {
    async addAnswers() {
      const google = await gmapsInit();
      Object.entries(this.answers).forEach(([uid, questionAnswers]) => {
        let maxTime = null;
        let maxAns = null;
        Object.values(questionAnswers[this.number] || []).forEach((ans) => {
          if (maxTime === null || maxTime < ans.time) {
            maxTime = ans.time;
            maxAns = ans;
          }
        });
        if (maxAns) {
          const marker = new google.maps.Marker({
            position: {
              lat: maxAns.lat,
              lng: maxAns.lng,
            },
            map: this.map,
            label: this.users[uid].abbr || this.users[uid].name.substring(0, 2) || '?',
            // icon: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png',
          });
          this.markers.push(marker);
        }
      });

      this.fitBounds();
    },
    async revealAnswer() {
      const ans = this.questions[this.number];
      const google = await gmapsInit();
      this.markers.push(new google.maps.Marker({
        position: {
          lat: ans.lat,
          lng: ans.lng,
        },
        map: this.map,
        icon: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png',
      }));
      this.revealed = true;
      this.fitBounds();
    },
    async fitBounds() {
      if (this.markers.length > 1) {
        const google = await gmapsInit();
        const bounds = new google.maps.LatLngBounds();
        this.markers.forEach((m) => {
          bounds.extend(m.getPosition());
        });
        this.map.fitBounds(bounds);
      } else {
        this.map.setCenter({ lat: 53.3502709, lng: -0.6932712 });
        this.map.setZoom(2);
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
