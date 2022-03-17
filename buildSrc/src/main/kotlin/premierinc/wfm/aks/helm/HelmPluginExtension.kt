package premierinc.wfm.aks.helm

import org.gradle.api.Action
import org.gradle.api.NamedDomainObjectContainer
import org.gradle.api.Project
import org.gradle.api.file.*
import org.gradle.api.model.ObjectFactory
import org.gradle.kotlin.dsl.*
import java.io.File
import javax.inject.Inject

open class HelmPluginExtension @Inject constructor(
    objects: ObjectFactory,
    private val layout: ProjectLayout
) {
    private val chartWriteDirectoryProperty = objects.directoryProperty()
    private val packageDirectoryProperty = objects.directoryProperty()
    private val sourceDirectoryProperty = objects.directoryProperty()

    val chartOutputDirectory
        get() = chartWriteDirectoryProperty
            .orElse(layout.buildDirectory.dir("helm/charts"))

    val packageOutputDirectory
        get() = packageDirectoryProperty
            .orElse(layout.buildDirectory.dir("helm/packages"))

    val sourceDirectory
        get() = sourceDirectoryProperty
            .orElse(layout.projectDirectory.dir("src/helm/charts"))

    val charts = objects.domainObjectContainer(HelmChart::class.java)

    fun packageOutputDirectory(directory: Directory) {
        chartWriteDirectoryProperty.set(directory)
        chartWriteDirectoryProperty.disallowChanges()
    }

    fun packageOutputDirectory(directory: File) {
        chartWriteDirectoryProperty.set(directory)
        chartWriteDirectoryProperty.disallowChanges()
    }

    fun chartOutputDirectory(directory: Directory) {
        chartWriteDirectoryProperty.set(directory)
        chartWriteDirectoryProperty.disallowChanges()
    }

    fun chartOutputDirectory(directory: File) {
        chartWriteDirectoryProperty.set(directory)
        chartWriteDirectoryProperty.disallowChanges()
    }

    fun sourceDirectory(directory: Directory) {
        sourceDirectoryProperty.set(directory)
        sourceDirectoryProperty.disallowChanges()
    }

    fun sourceDirectory(directory: File) {
        sourceDirectoryProperty.set(directory)
        sourceDirectoryProperty.disallowChanges()
    }

    fun charts(action: Action<NamedDomainObjectContainer<HelmChart>>) {
        action.execute(charts)
    }

    companion object {
        fun Project.wfmHelm(): HelmPluginExtension {
            return extensions.create("wfmHelm")
        }
    }
}
