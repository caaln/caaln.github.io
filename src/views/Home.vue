<template>
  <div class="home">
    <div v-if="!loaded">Authenticating...</div>
    <Name v-else-if="name == null" @set-name="setName" />
    <Admin v-else-if="name === 'kirstyisadumdum' || adminMode" @set-name="setName" />
    <Quiz v-else-if="name === 'kirstyisadumset'" :uid="uid" :set-mode="true" @set-name="setName" />
    <ControlPanel v-else-if="name === 'kirstyisadumadmin'" :uid="uid" @set-name="setName"  />
    <Quiz v-else :uid="uid" @set-name="setName" />
  </div>
</template>

<script>
import firebaseInit from '@/utils/firebase';
import Name from '@/components/Name.vue';
import Quiz from '@/components/Quiz.vue';
import Admin from '@/components/Admin.vue';
import ControlPanel from '@/components/ControlPanel.vue';

export default {
  name: 'Home',
  components: {
    Admin,
    ControlPanel,
    Name,
    Quiz,
  },
  data() {
    return {
      loaded: false,
      name: null,
      uid: null,
      adminMode: false,
    };
  },
  mounted() {
    firebaseInit().auth().signInAnonymously();
    firebaseInit().auth().onAuthStateChanged((user) => {
      if (user.uid) {
        this.uid = user.uid;

        firebaseInit().database().ref('adminMode')
          .on('value', (d) => {
            this.adminMode = d.val() || false;
            this.loaded = true;
          });

        firebaseInit().database().ref(`user/${this.uid}`)
          .on('value', (d) => {
            this.name = d.val() ? d.val().name : null;
            this.loaded = true;
          });
      }
    });
  },
  methods: {
    setName(name) {
      firebaseInit().database().ref(`user/${this.uid}`).set({ name });
      this.name = name;
    },
  },
};
</script>
