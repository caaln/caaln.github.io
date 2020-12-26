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
              v-if="answer !== undefined && answer !== null && answer !== ''"
              :disabled="submitting"
              @click="submitAnswer">Submit</button>
      <h2 id="number" class="m-0">Question {{ number }}</h2>
    </div>

    <div v-if="number < fbMinQuestion || number > fbMaxQuestion">
      This question is not open, please wait.
    </div>
    <div v-else-if="question" class="answer">
      <div style="font-size: 2em; font-weight: bold;">{{ question.question }}</div>
      <Map v-if="question.type === 'latlng'" v-model="answer" />
      <input v-else-if="question.type === 'text'" ref="input" type="text" v-model="answer" />
      <input v-else-if="question.type === 'number'" ref="input" type="number" v-model="answer" />
    </div>
  </div>
</template>

<script>
import firebase from 'firebase/app';
import firebaseInit from '@/utils/firebase';
import Map from './Map.vue';

/* eslint-disable no-new */
export default {
  name: 'Quiz',
  components: {
    Map,
  },
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
      answer: null,
      fbMinQuestion: -1,
      fbMaxQuestion: -1,
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

    firebaseInit().database().ref('min_question')
      .on('value', (d) => {
        this.fbMinQuestion = d.val() || -1;
      });

    firebaseInit().database().ref('max_question')
      .on('value', (d) => {
        this.fbMaxQuestion = d.val() || -1;
      });
  },
  computed: {
    question() {
      return this.questions[this.number] !== undefined ? this.questions[this.number] : null;
    },
  },
  methods: {
    submitAnswer() {
      if (this.submitting) {
        return false;
      }
      if (!this.$refs.input.checkValidity()) {
        return false;
      }
      this.submitting = true;

      const data = {
        type: 'text',
        answer: this.answer,
        time: firebase.database.ServerValue.TIMESTAMP,
      };

      this.answer = null;

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

      return true;
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
