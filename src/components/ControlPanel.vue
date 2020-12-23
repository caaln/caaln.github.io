<template>
  <div class="d-flex flex-column min-vh-100">
    <div id="head" class="p-1 flex-grow-0">
      <div class="dropdown float-left mr-2">
        <button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton"
                data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">

        </button>
        <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
          <a class="dropdown-item" @click="$emit('set-name', null)">Set Name</a>
        </div>
      </div>

      <label>
        Min question:
        <input type="number" v-model="minQuestion" />
      </label>

      <label>
        Max question:
        <input type="number" v-model="maxQuestion" />
      </label>

      <button id="update" class="btn btn-primary float-right"
              v-if="minQuestion !== fbMinQuestion || maxQuestion !== fbMaxQuestion"
              :disabled="submitting"
              @click="setLimits">Update</button>
    </div>

    <table v-if="users && questions" class="table table-striped">
      <thead>
      <tr>
        <th>#</th>
        <th>Question</th>
        <th v-for="(u, k) in users" :key="k">{{ u.name || '' }}</th>
      </tr>
      </thead>
      <tbody>
      <tr
        v-for="(q, n) in questions"
        :key="n"
        :class="{'table-info': n >= fbMinQuestion && n <= fbMaxQuestion}"
      >
        <td>{{ n }}</td>
        <td>{{ q.question }}</td>
        <td v-for="k in Object.keys(users)" :key="k">{{ lastAnswer(k,n) }}</td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import firebaseInit from '@/utils/firebase';

/* eslint-disable no-new */
export default {
  name: 'ControlPanel',
  data() {
    return {
      users: {},
      questions: [],
      answers: {},
      minQuestion: -1,
      fbMinQuestion: null,
      maxQuestion: -1,
      fbMaxQuestion: null,
      submitting: false,
    };
  },
  async mounted() {
    firebaseInit().database().ref('question')
      .on('value', (d) => {
        this.questions = d.val() || [];
      });

    firebaseInit().database().ref('user')
      .on('value', (d) => {
        this.users = Object.fromEntries(Object.entries(d.val()).filter(([, v]) => !v.name.startsWith('kirstyisadum')));
      });

    firebaseInit().database().ref('answer')
      .on('value', (d) => {
        this.answers = d.val() || {};
      });

    firebaseInit().database().ref('min_question')
      .on('value', (d) => {
        this.fbMinQuestion = d.val() || -1;
        this.minQuestion = this.fbMinQuestion;
      });

    firebaseInit().database().ref('max_question')
      .on('value', (d) => {
        this.fbMaxQuestion = d.val() || -1;
        this.maxQuestion = this.fbMaxQuestion;
      });
  },
  methods: {
    lastAnswer(uKey, n) {
      if (!this.answers[uKey] || !this.answers[uKey][n]) {
        return '';
      }

      let maxTime = null;
      let maxAns = null;
      Object.values((this.answers[uKey][n] || {})).forEach((ans) => {
        if (maxTime === null || maxTime < ans.time) {
          maxTime = ans.time;
          maxAns = ans;
        }
      });
      return maxAns.answer;
    },

    setLimits() {
      this.submitting = true;
      firebaseInit().database().ref('min_question').set(this.minQuestion, this.submitOff);
      firebaseInit().database().ref('max_question').set(this.maxQuestion, this.submitOff);
    },

    submitOff() {
      this.submitting = false;
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
