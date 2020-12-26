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
        <th>Answer</th>
        <template v-for="(u, k) in users">
          <th :key="`${k}_name`">{{ u.name || '' }}</th>
          <th :key="`${k}_diff`">Diff</th>
          <th :key="`${k}_score`">Score</th>
          <th :key="`${k}_acc`">Acc</th>
        </template>
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
        <td class="border-left border-right">{{ q.answer }}</td>
        <template v-for="k in Object.keys(users)">
          <td :key="`${k}_answer`" class="border-left">{{ lastAnswer(k,n) }}</td>
          <td :key="`${k}_diff`">{{ diff(k,n) }}</td>
          <td :key="`${k}_score`">{{ scores[n][k] }}</td>
          <td :key="`${k}_acc`" class="font-weight-bold border-right">
            {{ scores.slice(0,n+1).map((s) => s[k]).reduce((a, b) => a + b, 0) }}
          </td>
        </template>
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
        this.users = Object.fromEntries(Object.entries(d.val() || {}).filter(([, v]) => !v.name.startsWith('kirstyisadum')));
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
  computed: {
    lastAnswers() {
      return this.questions.map(
        (q, n) => Object.fromEntries(
          Object.keys(this.users).map(
            uKey => [uKey, this.lastAnswer(uKey, n)],
          ),
        ),
      );
    },
    scores() {
      return this.questions.map(
        (q, n) => Object.fromEntries(
          Object.keys(this.users).map(
            uKey => [uKey, this.score(uKey, n)],
          ),
        ),
      );
    },
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

    diff(uKey, n) {
      const trueAnswer = this.questions[n].answer;
      return (Math.abs(trueAnswer - this.lastAnswers[n][uKey]) / trueAnswer * 100).toFixed(2);
    },

    score(uKey, n) {
      const answer = this.lastAnswers[n][uKey];
      const trueAnswer = this.questions[n].answer;

      const diff = Math.abs(trueAnswer - answer);

      let score = 0;
      if (trueAnswer === answer) {
        score += 6;
      } else if (diff / trueAnswer <= 0.2) {
        score += 2;
      } else if (diff / trueAnswer <= 0.35) {
        score += 1;
      }

      const closest = Math.min(
        ...Object.values(this.lastAnswers[n]).map(v => Math.abs(trueAnswer - v)),
      );
      if (trueAnswer !== answer && diff <= closest && diff / trueAnswer < 0.5) {
        score += 3;
      }

      return score;
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
