<template>

    <Jumbotron/>

    <section class="bg-white dark:bg-gray-900">
        <div class="py-8 mx-auto max-w-screen-xl lg:py-16">
            <div class="grid md:grid-cols-2 gap-8">
                
                <div class="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 md:p-10 max-w-2xl mx-auto">
                    <h2 class="text-gray-900 dark:text-white text-3xl font-extrabold mb-2 text-center">Jumlah SOP pada tiap unit kerja</h2>
                    <Chart/>
                </div>

                <div class="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 md:p-10 max-w-2xl mx-auto">
                    <h2 class="text-gray-900 dark:text-white text-3xl font-extrabold mb-2 text-center">Best react libraries around the web</h2>
                    <!-- <p class="text-lg font-normal text-gray-500 dark:text-gray-400 mb-4">Static websites are now used to bootstrap lots of websites and are becoming the basis for a variety of tools that even influence both web designers and developers.</p> -->
                    <!-- <SOPTable/> -->
                    
                    <RouterLink to="/sop">
                        <p class="text-blue-600 dark:text-blue-500 hover:underline font-medium text-lg inline-flex items-center mt-10">
                            Read more
                            <svg class="w-3.5 h-3.5 ms-2 rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10">
                                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5h12m0 0L9 1m4 4L9 9"/>
                            </svg>
                        </p>
                    </RouterLink>
                    
                </div>
            </div>
        </div>
    </section>
    
</template>

<script setup>
    import Chart from '@/components/home/Chart.vue'
    import Jumbotron from '@/components/home/Jumbotron.vue';
    import SOPTable from '@/components/home/HomeTable.vue';
</script>
