package premierinc.wfm.aks.properties

import org.gradle.api.Plugin
import org.gradle.api.Project
import org.gradle.kotlin.dsl.*
import premierinc.wfm.aks.properties.BuildPropertiesExtension.Companion.wfmBuildProperties

open class BuildPropertiesPlugin: Plugin<Project> {
    override fun apply(target: Project) = target.run {
        val buildPropertiesExtension = wfmBuildProperties()

        tasks.register<EnvScriptPrintPropertiesTask> ("createEnvironmentVariableScript") {
            group = TASK_GROUP
            outputFile.set(layout.buildDirectory.file("properties/build_properties_env.sh"))
            variables.putAll(buildPropertiesExtension.buildProperties)
        }

        return@run
    }

    companion object {
        const val TASK_GROUP = "build properties"
    }
}
