<template>
  <nav class="navbar navbar-dark bg-dark p-0">
    <!-- Navbar content -->
    
    <div class="container-fluid">
      <Burger @toggle-menu="toggleMenu"></Burger>
      <!-- Brand -->
      <div class="navbar-brand" href="#">iDig webapp</div>

      <!-- select server -->
      <ul class="navbar-nav flex-row flex-wrap bd-navbar-nav pt-2 py-md-0">
        <li class="nav-item col-1 col-md-auto p-0">
          <a class="nav-link p-2">server:</a>
        </li>
        <li class="nav-item col-2 col-md-auto p-0">
          <input
            class="m-2 text-light"
            v-model="server"
            style="background: #212529; border: 0px"
          />
        </li>
        <!-- select project -->
        <li class="nav-item col-1 col-md-auto p-0">
          <a class="nav-link p-2">projet:</a>
        </li>
        <li class="nav-item col-2 col-md-auto p-0">
          <select
            class="m-2 text-light"
            v-model="project"
            style="background: #212529; border: 0px; height: 26px"
          >
            <option v-for="project in projects" :key="project" :value="project">
              {{ project }}
            </option>
          </select>
        </li>
        <li class="nav-item col-1 col-md-auto p-0">
          <a class="nav-link p-2">user:</a>
        </li>
        <li class="nav-item col-2 col-md-auto p-0">
          <input
            class="m-2 text-light"
            v-model="username"
            style="background: #212529; border: 0px"
          />
        </li>
        <li class="nav-item col-1 col-md-auto p-0">
          <input
            type="password"
            class="m-2 text-light"
            v-model="password"
            style="background: #212529; border: 0px"
            placeholder="Password"
          />
        </li>
       <li class="nav-item col-1 col-md-auto p-0">
        <!-- test API connexion -->
        <button
          type="button"
          class="m-2"
          style="height: 26px"
          @click="testConnexion"
        >
          connexion
        </button>
        </li>
      </ul>
    </div>
  </nav>
</template>
<script>
import axios from "axios";
import Burger from '../components/Burger.vue';
export default {
  data() {
    return {
      server: "localhost",
      project: "Amarynthos",
      projects: ["Amarynthos", "Agora"],
      selectedProject: {
        Agora: ["ΒΓ 2013", "ΒΘ West 2013"],
        Amarynthos: ["AMA21-S24", "AMA22-S22C"],
      },
      username: "idig",
      password: "idig",
    };
  },

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
  },
  computed: {

   
  },
  components: {
   Burger
 },
  methods: {
    retrieveToLocal: function () {
      this.server = localStorage.getItem("IdigServer");
    },
    testConnexion: function () {
      //store to local
      localStorage.setItem("IdigServer", this.server);
      localStorage.setItem("project", this.project);
      localStorage.setItem("username", this.username);
      localStorage.setItem("password", this.password);

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
          this.selectedProject[this.project][0] +
          "/surveys",
        auth: {
          username: this.username,
          password: this.password,
        },
        data: {},
      })
        .then(() => {
          alert("connection valide");
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
    toggleMenu() {
        this.isBurgerActive = !this.isBurgerActive;
        this.$emit("toggle-menu", "none");
      },
  },
};
</script>