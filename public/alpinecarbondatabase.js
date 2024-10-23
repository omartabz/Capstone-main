document.addEventListener('alpine:init', () => {
    Alpine.data('CarbonTracker', function () {
        return {
            title: 'Carbon Project Database',
            projects: [],
            id: '',
            projectId: '',
            newProjectId: '',
            newProjectName: '',
            newScope: '',
            newCreditsAvailable: '',
            newCreditsIssued: '',
            createStatus: '',
            deleteProject: '',
            deleteStatus: '',
            updateProjectId: '',
            updateProjectName: '',
            updateScope: '',
            updateCreditsAvailable: '',
            updateCreditsIssued: '',
            updateStatus: '',
            findSellers:'',
            sellerCredits:0,

            init() {
                this.getProjects()
            },
            getProjects() {
                const ProjectsURL = `http://localhost:4003/api/carbon/projects`;
                return axios.get(ProjectsURL)
                    .then(response => {
                        console.log(response.data);
                        this.projects = response.data;
                        // this.projects = []
                        // const n = response.data.length
                        // for (let i = 0; i < n; i++) {
                        //     if (response.data[i].project_id== null) {
                        //         continue
                        //     }
                        //     this.projects.push({
                        //         project_id: response.data[i].newProjectId,
                        //         project_name: response.data[i].newProjectName,
                        //         scope: response.data[i].newScope,
                        //         total_credits_available: response.data[i].newCreditsAvailable,
                        //         total_credits_issued: response.data[i].newCreditsIssued,
                        //     })
                        // }

                        console.log(this.projects);
                        

                    })
            },

            createProject() {
                axios.post('http://localhost:4003/api/carbon/add', {
                    project_id: this.newProjectId,
                    project_name: this.newProjectName,
                    scope: this.newScope,
                    total_credits_available: this.newCreditsAvailable,
                    total_credits_issued: this.newCreditsIssued
                }).then(response => {
                    this.createStatus = response.data.message
                    setTimeout(()=>{
                        this.createStatus=''
                    }, 5000)
                    this.newProjectId = ''
                    this.newProjectName = ''
                    this.newScope = ''
                    this.newCreditsAvailable = ''
                    this.newCreditsIssued = ''
                    this.getProjects()
                }).catch(error => (
                    console.log(error)
                ))
            },

            removeProject() {
                return axios.post('http://localhost:4003/api/carbon/delete', {
                    project_id: this.deleteProject
                }).then(response => {
                    this.deleteStatus = response.data.message
                    setTimeout(()=>{
                        this.deleteStatus=''
                    }, 5000)
                    this.getProjects()
                })
            },
            findSeller(){
                return axios.post('http://localhost:4003/api/carbon/seller',{
                total_credits_available: this.sellerCredits,  
            }).then(response => {
                this.findSellers = response.data
                console.log(this.findSellers);
            })
        },

            updateProject() {
                return axios.post('http://localhost:4003/api/carbon/update', {
                    project_id: this.updateProjectId,
                    project_name: this.updateProjectName,
                    scope: this.updateScope,
                    total_credits_available: this.updateCreditsAvailable,
                    total_credits_issued: this.updateCreditsIssued
                }).then(response => {
                    this.updateStatus = response.data.message
                    setTimeout(()=>{
                        this.updateStatus=''
                    }, 5000)
                    this.getProjects()
                })
            }
        }
    })
}
)
