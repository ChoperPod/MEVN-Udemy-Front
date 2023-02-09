<template>
    <div class="container">
        <h1>Login</h1>
        <form @submit.prevent="login">
            <input type="text" class="form-control my-2" placeholder="Ingrese email" v-model="usuario.email" />
            <input type="text" class="form-control my-2" placeholder="Ingrese contraseña" v-model="usuario.pass" />
            <button type="submit">Acceder</button>
        </form>
        <div v-if="mensaje !== ''">
            <p>{{ mensaje }}</p>
        </div>
    </div>
</template>

<script>
    import { mapState, mapMutations, mapActions } from 'vuex';
    import router from '@/router';

    export default {
        data(){
            return{
                usuario: {email: 'persona3@hotmail.com', pass: '123123'},
                mensaje: ''
            }
        },
    methods: {
        ...mapMutations(['obtenerUsuario']),
        ...mapActions(['guardarUsuario', 'leerToken', 'cerrarSesion']),
        login(){
            console.log(this.usuario)
            this.axios.post('/login', this.usuario)
            .then(res => {
                console.log(res.data)
                const token = res.data.token;
                this.guardarUsuario(token);
                this.$router.push({name: 'notas'})
            })
            .catch(err => {
                console.log('error catch')
                console.log(err.response);
                this.mensaje = err.response.data.mensaje;
            })
        }
    }
}
</script>