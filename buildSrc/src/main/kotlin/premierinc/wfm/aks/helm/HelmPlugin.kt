package premierinc.wfm.aks.helm

import com.google.common.base.CaseFormat
import org.gradle.api.Plugin
import org.gradle.api.Project
import org.gradle.api.tasks.Copy
import org.gradle.api.tasks.Exec
import org.gradle.kotlin.dsl.*
import org.gradle.process.CommandLineArgumentProvider
import premierinc.wfm.aks.helm.HelmPluginExtension.Companion.wfmHelm
import premierinc.wfm.aks.properties.BuildPropertiesExtension.Companion.wfmBuildProperties
import premierinc.wfm.aks.properties.BuildPropertiesPlugin

open class HelmPlugin : Plugin<Project> {
    companion object {
        const val TASK_GROUP = "helm"
    }

    override fun apply(project: Project) = project.run {
        val helm = wfmHelm()

        val createHelmCharts by tasks.registering {
            group = TASK_GROUP
        }
        val packageHelmCharts by tasks.registering {
            group = TASK_GROUP
        }

        helm.charts.all {
            val nameForTasks = CaseFormat.LOWER_CAMEL.to(CaseFormat.UPPER_CAMEL, name)

            val chartDirectory = helm.chartOutputDirectory
                .map { it.dir(chartName) }

            if (!appVersion.isPresent) {
                appVersion(project.version as String)
            }

            val copyChartDirectory = tasks.register<Copy>("create${nameForTasks}Chart") {
                group = TASK_GROUP
                from(helm.sourceDirectory.map { it.dir(chartName) }.get().asFile)
                from(extraFiles)
                into(chartDirectory)
                exclude("secrets")
            }

            createHelmCharts.configure { dependsOn(copyChartDirectory) }

            val packageChart = tasks.register<Exec>("package${nameForTasks}Chart") {
                group = TASK_GROUP
                dependsOn(copyChartDirectory)
                executable("helm")
                argumentProviders.add(CommandLineArgumentProvider {
                    listOf(
                        "package", chartDirectory.get().asFile.path,
                        "--app-version", appVersion.get(),
                        "--version", chartVersion.get(),
                        "--destination", helm.packageOutputDirectory.get().asFile.path
                    )
                })
                environment(
                    "HELM_EXPERIMENTAL_OCI" to "1"
                )
                doFirst {
                    chartDirectory.get().asFile.mkdirs()
                }
            }

            packageHelmCharts.configure { dependsOn(packageChart) }

            plugins.withType<BuildPropertiesPlugin> {
                wfmBuildProperties().buildProperties {
                    put("helm.packageDirectory", helm.packageOutputDirectory.get().asFile.path)

                    helm.charts.forEach { chart ->
                        put("helm.${chart.name}.chartName", chart.chartName)
                        put("helm.${chart.name}.appVersion", chart.appVersion.get())
                        put("helm.${chart.name}.chartVersion", chart.chartVersion.get())
                    }
                }
            }
        }
    }
}
