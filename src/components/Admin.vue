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
              @click="revealed = !revealed">{{ revealed ? 'Hide' : 'Reveal' }}</button>
      <h2 id="number" class="m-0">Question {{ number }}</h2>
    </div>

    <div v-if="question && questionAnswers" class="answer">
      <template v-if="question.type === 'text'">
        <div v-for="(answer, name) in questionAnswers" :key="name">
          {{ name }}: {{ answer }}
        </div>
      </template>
    </div>

    <div v-if="revealed" style="font-size: 2rem; font-weight: bold; padding: 4rem;">
      The answer was {{ question.answer }}
    </div>
  </div>
</template>

<script>
import firebaseInit from '@/utils/firebase';

/* eslint-disable no-new */
export default {
  name: 'Admin',
  data() {
    return {
      users: {},
      questions: [],
      answers: {},
      number: 0,
      revealed: false,
    };
  },
  async mounted() {
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
      });
  },
  computed: {
    question() {
      return this.questions[this.number] !== undefined ? this.questions[this.number] : null;
    },
    questionAnswers() {
      if (!this.answers) {
        return null;
      }

      return Object.fromEntries(
        Object.entries(this.answers)
          .map(([t, a]) => {
            let maxTime = null;
            let maxAns = null;
            Object.values(a[this.number]).forEach((ans) => {
              if (maxTime === null || maxTime < ans.time) {
                maxTime = ans.time;
                maxAns = ans;
              }
            });
            return [this.users[t].name, maxAns.answer || null];
          })
          .filter(([, a]) => a !== null),
      );
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
