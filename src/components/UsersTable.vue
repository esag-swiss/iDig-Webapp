<template>
        <thead>
        <tr>
          <!-- <th v-for="header in Object.keys(users[0])" :key="header.id">{{header}}</th> -->
          <th v-for="header in headers" :key="header.id">{{header.field}}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.id">
          <td v-for="header in headers" :key="header.id">{{row[header.field]}}</td>
        </tr>
        <!-- <tr>
          <td scope="row">{{ key }}</td>
          <td>{{ name }}</td>
          <td>{{ phoneNumber }}</td>
          <td>{{ emailAddress }}</td>
          <td>{{ friendTruc }}</td>
          <td>{{ friendType }}</td>
        </tr> -->

      </tbody>
</template>

<script>

import usersData from "../components/Friends.json";
import headersData from "../components/Friends.Preferences.json";

export default {
  props: {
    name: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: Number,
      required: false
    },
    emailAddress: {
      type: String,
      required: true
    },
    friendType: {
      type: String,
      required: false
    },
    friendTruc: {
      type: String,
      required: false
    },    
  },
  data() {
    return {
      rows: usersData,
      headers: headersData.fields
    };
  },
};
</script>