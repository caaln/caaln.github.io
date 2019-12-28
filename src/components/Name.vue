<template>
  <div style="max-width: 80vw; margin: auto; margin-top: 50px;">
    <div class="form-group">
      <label>Please enter a team name:</label>
      <input class="form-control" type="text" value="" v-model="name"/>
    </div>
    <button class="btn btn-primary d-block" @click="$emit('set-name', name)">Submit</button>
  </div>
</template>

<script>
export default {
  name: 'name',
  data() {
    return {
      name: null,
    };
  },
};
</script>
