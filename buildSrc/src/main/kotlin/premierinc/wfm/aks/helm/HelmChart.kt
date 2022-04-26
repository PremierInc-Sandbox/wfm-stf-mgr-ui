package premierinc.wfm.aks.helm

import com.google.common.base.CaseFormat
import org.gradle.api.Action
import org.gradle.api.Named
import org.gradle.api.file.ConfigurableFileCollection
import org.gradle.api.model.ObjectFactory
import org.gradle.api.provider.Provider
import org.gradle.api.provider.ProviderFactory
import org.gradle.kotlin.dsl.property
import javax.inject.Inject

open class HelmChart @Inject constructor(
    private val name: String,
    private val objects: ObjectFactory,
    private val providers: ProviderFactory
): Named {
    override fun getName(): String = name

    private val appVersionProperty = objects.property<String>()
    private val chartVersionProperty = objects.property<String>()
    internal val extraFiles = objects.fileCollection()

    val appVersion: Provider<String>
        get() = appVersionProperty
            .orElse(providers.gradleProperty("${name}ChartVersion"))
            .orElse(providers.gradleProperty("chartVersion"))

    val chartVersion: Provider<String>
        get() = chartVersionProperty
            .orElse(providers.gradleProperty("${name}AppVersion"))
            .orElse(providers.gradleProperty("appVersion"))
            .orElse(appVersion)

    val chartName: String = CaseFormat.LOWER_CAMEL.to(CaseFormat.LOWER_HYPHEN, name)

    fun appVersion(appVersion: String) {
        this.appVersionProperty.set(appVersion)
        this.appVersionProperty.disallowChanges()
    }

    fun chartVersion(chartVersion: String) {
        this.chartVersionProperty.set(chartVersion)
        this.chartVersionProperty.disallowChanges()
    }

    fun extraFiles(action: Action<in ConfigurableFileCollection>) {
        action.execute(extraFiles)
        extraFiles.disallowChanges()
    }
}
