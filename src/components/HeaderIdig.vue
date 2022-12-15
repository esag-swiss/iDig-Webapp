<template>
  <nav class="navbar navbar-dark bg-dark p-0">
    <!-- Navbar content -->
    <div class="container-fluid">
      <ul class="navbar-nav flex-row flex-wrap bd-navbar-nav pt-2 py-md-0">
        <Burger @toggle-menu="toggleMenu"></Burger>
        <!-- Title -->
        <div class="navbar-brand pr-3" href="#">iDig webapp</div>
      </ul>
      <form class="form-inline my-2 my-lg-0">
        <!-- select server -->
        <div class="navbar-text text-light p-2">server:</div>
        <input class="my-2 text-light" v-model="server" style="background: #212529; border: 0px; width: 7em" />
        <!-- select project -->
        <a class="navbar-text text-light p-2">projet:</a>
        <select class="m-2 text-light" v-model="project" style="background: #212529; border: 0px; height: 26px"
    >
          <option v-for="project in projects" :key="project" :value="project">
            {{ project }}
          </option>
        </select>
        <!-- select user -->
        <a class="navbar-text text-light p-2">user:</a>
        <input class="m-2 text-light" v-model="username" style="background: #212529; border: 0px; width: 6em" />
        <input type="password" class="m-2 text-light" v-model="password"
          style="background: #212529; border: 0px; width: 6em" placeholder="Password" />
        <button type="button" class="btn  btn-outline-secondary my-0 my-sm-0 m-2 p-0" :class="{ isConnected: isActive }"
          @click="testConnexion(), getPreference(), emitallTrenches()">
          connexion
        </button>
      </form>

    </div>
  </nav>
</template>
<script>
import axios from "axios";
import Burger from "../components/Burger.vue";
import Preferences from "../data/Amarynthos.Preferences.json";

export default {
  data() {
    return {
      server: "localhost",
      project: "Amarynthos",
      Preferences: Preferences,
      projects: ["Amarynthos", "Agora"],
      username: "idig",
      password: "idig",
      isActive: false,
    };
  },
  components: {
    Burger,
  },
  // charge les préférences de connexion si elles existent  
  mounted() {
    if (localStorage.IdigServer) {
      this.server = localStorage.IdigServer;
    }
    if (localStorage.project) {
      this.project = localStorage.project;
    }
    if (localStorage.IdigServer) {
      this.username = localStorage.username;
    }
    if (localStorage.project) {
      this.password = localStorage.password;
    }
    // charger des trenches si absente dans local storage
    // if (localStorage.trenches) {
    //   localStorage.setItem("trenches", JSON.stringify(this.Preferences[this.project]));
    // }
  },
  computed: {
    trenches() {
      return this.Preferences[this.project];
    },

  },



  methods: {
    retrieveToLocal: function () {
      this.server = localStorage.getItem("IdigServer");
    },
    testConnexion: function () {
      this.server = this.server.replace("https://", "");
      this.server = this.server.replace("http://", "");
      this.server = this.server.replace(":9000", "");
      //store to local
      localStorage.setItem("IdigServer", this.server);
      localStorage.setItem("project", this.project);
      localStorage.setItem("username", this.username);
      localStorage.setItem("password", this.password);
localStorage.setItem("trenches", JSON.stringify(this.Preferences[this.project]));
      //test connexion
      axios({
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        method: "get",
        url:
          "http://" +
          this.server +
          ":9000/idig/" +
          this.project +
          "/" +
          this.trenches[0] +
          "/surveys",
        auth: {
          username: this.username,
          password: this.password,
        },
        data: {},
      })
        .then(() => {
          // alert("connection valide");
          this.isActive = true;
        })
        .catch((error) => {
          if (error.response.status == 401) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            alert(error.response.data + "or project"); // idig server retourne 401 si le endpoint n'est pas bon
            console.log(error.response.status);
            console.log(error.response.headers);
          } else {
            alert("server not reachable");
          }
        });

    },
    getPreference() { // attention gérer les cas où il n'y a pas de preferneces
      var session_url =
        "http://" + this.server + ":9000/idig/Amarynthos/" +
        this.trenches[0];
      axios({
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        method: "post",
        url: session_url,
        auth: {
          username: this.username,
          password: this.password,
        },
        data: {
          head: "",
          surveys: [],
        },
      }).then((response) => {
        // this.preferences = Buffer.from(response.data.preferences, 'base64').toString('ascii');
        this.preferences = atob(response.data.preferences);
        this.preferences = JSON.parse(this.preferences);

        // alert(this.preferences.project);
        
        // alert(atob(response.data.preferences) );
        // alert(response.data.preferences); //string en base64
        // alert(response.data.version); 
      });
    },

    emitallTrenches() {
      this.$emit("all-trenches", this.trenches);
    },
    toggleMenu() {
      this.isBurgerActive = !this.isBurgerActive;
      this.$emit("toggle-menu");

    },
  },
};
</script>
<style>
.isConnected {

  color: #fff;
  background-color: #28a745;
  border-color: #28a745;
}
</style>