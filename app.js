// Aplicación Vue 3 - Gestor de Recetas
// Usando Options API como se requiere en el parcial

const { createApp } = Vue;

// Componente para mostrar cada receta individual
const RecipeCard = {
    props: {
        receta: {
            type: Object,
            required: true
        }
    },
    template: `
        <div class="recipe-card" :class="{ 'favorita': receta.esFavorita }">
            <div class="card-header">
                <h3>{{ receta.nombre }}</h3>
                <div class="card-badges">
                    <span class="badge tipo" :class="receta.tipo">{{ formatearTipo(receta.tipo) }}</span>
                    <span class="badge dificultad" :class="receta.dificultad">{{ formatearDificultad(receta.dificultad) }}</span>
                    <span v-if="receta.esFavorita" class="badge favorita">Favorita</span>
                </div>
            </div>
            
            <div class="card-image">
                <img :src="obtenerImagen(receta.tipo)" :alt="receta.nombre" />
            </div>
            
            <div class="card-content">
                <p class="descripcion">{{ receta.descripcion }}</p>
                
                <div class="recipe-info">
                    <div class="info-item">
                        <span class="icon">Tiempo:</span>
                        <span>{{ receta.tiempo }} min</span>
                    </div>
                    <div class="info-item">
                        <span class="icon">Tipo:</span>
                        <span>{{ receta.tipo }}</span>
                    </div>
                </div>
                
                <div class="ingredientes">
                    <h4>Ingredientes:</h4>
                    <ul>
                        <li v-for="ingrediente in receta.ingredientes.split(',')" :key="ingrediente">
                            {{ ingrediente.trim() }}
                        </li>
                    </ul>
                </div>
            </div>
            
            <div class="card-actions">
                <like-counter 
                    :receta-id="receta.id"
                    :initial-likes="receta.likes || 0"
                    @like-updated="actualizarLikes"
                ></like-counter>
                
                <div class="action-buttons">
                    <button 
                        @click="$emit('toggle-favorita', receta.id)"
                        class="btn btn-sm"
                        :class="receta.esFavorita ? 'btn-warning' : 'btn-outline'"
                    >
                        {{ receta.esFavorita ? 'Favorita' : 'Marcar Favorita' }}
                    </button>
                    
                    <button 
                        @click="$emit('eliminar', receta.id)"
                        class="btn btn-sm btn-danger"
                    >
                        Eliminar
                    </button>
                </div>
            </div>
        </div>
    `,
    methods: {
        // Método para formatear el tipo de cocina (filtro personalizado)
        formatearTipo(tipo) {
            const tipos = {
                'ramen': 'Ramen',
                'sushi': 'Sushi',
                'donburi': 'Donburi',
                'tempura': 'Tempura',
                'curry-japones': 'Curry japonés',
                'okonomiyaki': 'Okonomiyaki',
                'yakitori': 'Yakitori',
                'bento': 'Bento',
                'wagashi': 'Wagashi'
            };
            return tipos[tipo] || tipo;
        },
        
        // Método para formatear la dificultad (filtro personalizado)
        formatearDificultad(dificultad) {
            const dificultades = {
                'facil': 'Fácil',
                'media': 'Media',
                'dificil': 'Difícil'
            };
            return dificultades[dificultad] || dificultad;
        },
        
        // Método para obtener imagen según el tipo de cocina
        obtenerImagen(tipo) {
            const imagenes = {
                'ramen': 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=300&h=200&fit=crop',
                'sushi': 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=300&h=200&fit=crop',
                'donburi': 'https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=300&h=200&fit=crop',
                'tempura': 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=300&h=200&fit=crop',
                'curry-japones': 'https://images.unsplash.com/photo-1551218808-94e220e084d2?w=300&h=200&fit=crop',
                'okonomiyaki': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop',
                'yakitori': 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=300&h=200&fit=crop',
                'bento': 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=300&h=200&fit=crop',
                'wagashi': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=200&fit=crop'
            };
            return imagenes[tipo] || 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=300&h=200&fit=crop';
        },
        
        // Método para actualizar likes
        actualizarLikes(recetaId, nuevosLikes) {
            this.$emit('like-updated', recetaId, nuevosLikes);
        }
    }
};

// Componente contador de likes
const LikeCounter = {
    props: {
        recetaId: {
            type: Number,
            required: true
        },
        initialLikes: {
            type: Number,
            default: 0
        }
    },
    data() {
        return {
            likes: this.initialLikes,
            isLiked: false
        };
    },
    template: `
        <div class="like-counter">
            <button 
                @click="toggleLike"
                class="like-btn"
                :class="{ 'liked': isLiked }"
            >
                {{ isLiked ? 'Me gusta' : 'Like' }} {{ likes }}
            </button>
        </div>
    `,
    methods: {
        toggleLike() {
            if (this.isLiked) {
                this.likes--;
            } else {
                this.likes++;
            }
            this.isLiked = !this.isLiked;
            this.$emit('like-updated', this.recetaId, this.likes);
        }
    }
};

// Aplicación principal
const app = createApp({
    data() {
        return {
            // Datos del formulario
            nuevaReceta: {
                nombre: '',
                descripcion: '',
                tipo: '',
                dificultad: '',
                tiempo: null,
                ingredientes: '',
                esFavorita: false
            },
            
            // Errores de validación
            errores: {},
            
            // Lista de recetas
            recetas: [],
            
            // Contador de ID para nuevas recetas
            siguienteId: 1
        };
    },
    
    computed: {
        // Computed para contar recetas favoritas
        recetasFavoritas() {
            return this.recetas.filter(receta => receta.esFavorita).length;
        }
    },
    
    mounted() {
        // Cargar datos del localStorage al inicializar
        this.cargarRecetas();
    },
    
    methods: {
        // Método para validar el formulario
        validarFormulario() {
            this.errores = {};
            let esValido = true;
            
            // Validar nombre
            if (!this.nuevaReceta.nombre.trim()) {
                this.errores.nombre = 'El nombre es obligatorio';
                esValido = false;
            }
            
            // Validar descripción
            if (!this.nuevaReceta.descripcion.trim()) {
                this.errores.descripcion = 'La descripción es obligatoria';
                esValido = false;
            }
            
            // Validar tipo
            if (!this.nuevaReceta.tipo) {
                this.errores.tipo = 'Debes seleccionar un tipo de cocina';
                esValido = false;
            }
            
            // Validar dificultad
            if (!this.nuevaReceta.dificultad) {
                this.errores.dificultad = 'Debes seleccionar una dificultad';
                esValido = false;
            }
            
            // Validar tiempo
            if (!this.nuevaReceta.tiempo || this.nuevaReceta.tiempo <= 0) {
                this.errores.tiempo = 'El tiempo debe ser mayor a 0';
                esValido = false;
            }
            
            // Validar ingredientes
            if (!this.nuevaReceta.ingredientes.trim()) {
                this.errores.ingredientes = 'Los ingredientes son obligatorios';
                esValido = false;
            }
            
            return esValido;
        },
        
        // Método para agregar nueva receta
        agregarReceta() {
            if (this.validarFormulario()) {
                const receta = {
                    id: this.siguienteId++,
                    ...this.nuevaReceta,
                    likes: 0,
                    fechaCreacion: new Date().toISOString()
                };
                
                this.recetas.push(receta);
                this.guardarRecetas();
                this.limpiarFormulario();
                
                // Mostrar mensaje de éxito (opcional)
                alert('¡Receta agregada exitosamente!');
            }
        },
        
        // Método para limpiar el formulario
        limpiarFormulario() {
            this.nuevaReceta = {
                nombre: '',
                descripcion: '',
                tipo: '',
                dificultad: '',
                tiempo: null,
                ingredientes: '',
                esFavorita: false
            };
            this.errores = {};
        },
        
        // Método para eliminar una receta
        eliminarReceta(id) {
            if (confirm('¿Estás seguro de que quieres eliminar esta receta?')) {
                this.recetas = this.recetas.filter(receta => receta.id !== id);
                this.guardarRecetas();
            }
        },
        
        // Método para alternar favorita
        toggleFavorita(id) {
            const receta = this.recetas.find(r => r.id === id);
            if (receta) {
                receta.esFavorita = !receta.esFavorita;
                this.guardarRecetas();
            }
        },
        
        // Método para limpiar todas las recetas
        limpiarTodasLasRecetas() {
            if (confirm('¿Estás seguro de que quieres eliminar TODAS las recetas? Esta acción no se puede deshacer.')) {
                this.recetas = [];
                this.guardarRecetas();
            }
        },
        
        // Método para guardar recetas en localStorage
        guardarRecetas() {
            try {
                localStorage.setItem('recetas_japonesas', JSON.stringify(this.recetas));
                localStorage.setItem('siguienteId', this.siguienteId.toString());
            } catch (error) {
                console.error('Error al guardar en localStorage:', error);
            }
        },
        
        // Método para cargar recetas del localStorage
        cargarRecetas() {
            try {
                const recetasGuardadas = localStorage.getItem('recetas_japonesas');
                const siguienteIdGuardado = localStorage.getItem('siguienteId');
                
                if (recetasGuardadas) {
                    this.recetas = JSON.parse(recetasGuardadas);
                }
                
                if (siguienteIdGuardado) {
                    this.siguienteId = parseInt(siguienteIdGuardado);
                }
                
                // Si no hay recetas, agregar algunas de ejemplo
                if (this.recetas.length === 0) {
                    this.agregarRecetasEjemplo();
                }
            } catch (error) {
                console.error('Error al cargar del localStorage:', error);
                this.agregarRecetasEjemplo();
            }
        },
        
        // Método para agregar recetas de ejemplo
        agregarRecetasEjemplo() {
            const recetasEjemplo = [
                {
                    id: 1,
                    nombre: 'Tonkotsu Ramen',
                    descripcion: 'Ramen de caldo de huesos de cerdo, rico y cremoso con fideos al dente',
                    tipo: 'ramen',
                    dificultad: 'dificil',
                    tiempo: 240,
                    ingredientes: 'Huesos de cerdo, Kombu, Katsuobushi, Miso, Shoyu, Fideos, Huevo, Cebolla verde',
                    esFavorita: false,
                    likes: 15,
                    fechaCreacion: new Date().toISOString()
                },
                {
                    id: 2,
                    nombre: 'Gyudon',
                    descripcion: 'Bowl de arroz con carne de res cocida en salsa dulce y salada',
                    tipo: 'donburi',
                    dificultad: 'media',
                    tiempo: 30,
                    ingredientes: 'Carne de res, Cebolla, Salsa de soja, Mirin, Sake, Azúcar, Arroz, Huevo',
                    esFavorita: true,
                    likes: 8,
                    fechaCreacion: new Date().toISOString()
                },
                {
                    id: 3,
                    nombre: 'Tempura mixta',
                    descripcion: 'Verduras y mariscos rebozados en masa ligera y fritos hasta dorar',
                    tipo: 'tempura',
                    dificultad: 'media',
                    tiempo: 35,
                    ingredientes: 'Langostinos, Batata, Zapallo kabocha, Harina, Agua helada, Aceite, Daikon',
                    esFavorita: false,
                    likes: 12,
                    fechaCreacion: new Date().toISOString()
                }
            ];
            
            this.recetas = recetasEjemplo;
            this.siguienteId = 4;
            this.guardarRecetas();
        }
    },
    
    components: {
        'recipe-card': RecipeCard,
        'like-counter': LikeCounter
    }
});

// Montar la aplicación
app.mount('#app');
